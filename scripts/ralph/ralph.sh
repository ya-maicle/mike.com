#!/bin/bash
# Ralph Wiggum - Autonomous AI agent loop
# Usage: ./ralph-loop [--tool gemini|claude|amp] [max_iterations]
#
# Based on snarktank/ralph (https://github.com/snarktank/ralph)
# Adapted for maicle.co.uk monorepo (pnpm + Next.js)
#
# Tools:
#   gemini  - Google Gemini CLI (default, requires GEMINI_API_KEY)
#   claude  - Anthropic Claude Code CLI
#   amp     - Amp AI CLI

set -e

# Parse arguments
TOOL="gemini"  # Default to Gemini CLI
MAX_ITERATIONS=10

while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)
      TOOL="$2"
      shift 2
      ;;
    --tool=*)
      TOOL="${1#*=}"
      shift
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      fi
      shift
      ;;
  esac
done

# Validate tool choice
if [[ "$TOOL" != "gemini" && "$TOOL" != "claude" && "$TOOL" != "amp" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'gemini', 'claude', or 'amp'."
  exit 1
fi

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$PROJECT_ROOT/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"

# Check PRD exists
if [ ! -f "$PRD_FILE" ]; then
  echo "Error: No PRD found at $PRD_FILE"
  echo "Copy the example: cp $SCRIPT_DIR/prd.json.example $PRD_FILE"
  exit 1
fi

# Archive previous run if branch changed
if [ -f "$LAST_BRANCH_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")

  if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
    DATE=$(date +%Y-%m-%d)
    FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

    echo "📦 Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"

    # Reset progress file for new run
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "Started: $(date)" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
  fi
fi

# Track current branch
CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
if [ -n "$CURRENT_BRANCH" ]; then
  echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

# --- Tool-specific setup ---

# Helper: find command or fall back to npx
find_or_npx() {
  local cmd="$1"
  local pkg="$2"
  if command -v "$cmd" &> /dev/null; then
    echo "$cmd"
  else
    echo "npx -y $pkg"
  fi
}

# Validate tool availability
case "$TOOL" in
  gemini)
    GEMINI_CMD=$(find_or_npx "gemini" "@google/gemini-cli")
    # Auth: Gemini CLI supports Google account login (default) or API key.
    # If GEMINI_API_KEY is set, it uses that. Otherwise, it uses cached
    # Google login credentials. First-time users run: gemini
    # (it opens a browser for Google OAuth — your Gemini subscription carries over).
    if [ -z "$GEMINI_API_KEY" ]; then
      echo "ℹ️  No GEMINI_API_KEY found — will use Google account login."
      echo "   If this is your first run, authenticate first: $GEMINI_CMD"
      echo ""
    fi
    ;;
  claude)
    CLAUDE_CMD=$(find_or_npx "claude" "@anthropic-ai/claude-code")
    ;;
esac

echo ""
echo "🤖 Starting Ralph Wiggum Loop"
echo "   Tool: $TOOL"
echo "   Max iterations: $MAX_ITERATIONS"
echo "   PRD: $PRD_FILE"
echo "   Progress: $PROGRESS_FILE"
echo ""

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  🔄 Ralph Iteration $i of $MAX_ITERATIONS ($TOOL)"
  echo "==============================================================="

  # Run the selected tool with the ralph prompt
  case "$TOOL" in
    gemini)
      # Use --yolo to auto-approve tools (shell, file edits)
      # Use -p "" to enable headless mode while reading prompt from stdin
      OUTPUT=$(cat "$SCRIPT_DIR/PROMPT.md" | $GEMINI_CMD --yolo -p "" 2>&1 | tee /dev/stderr) || true
      ;;
    claude)
      OUTPUT=$($CLAUDE_CMD --dangerously-skip-permissions --print < "$SCRIPT_DIR/PROMPT.md" 2>&1 | tee /dev/stderr) || true
      ;;
    amp)
      OUTPUT=$(cat "$SCRIPT_DIR/PROMPT.md" | amp --dangerously-allow-all 2>&1 | tee /dev/stderr) || true
      ;;
  esac

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "✅ Ralph completed all tasks!"
    echo "   Finished at iteration $i of $MAX_ITERATIONS"
    echo "   Check progress.txt for full history."
    exit 0
  fi

  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "⚠️  Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "   Check progress.txt for status."
echo "   Run again with a higher limit: ./ralph-loop $((MAX_ITERATIONS + 10))"
exit 1
