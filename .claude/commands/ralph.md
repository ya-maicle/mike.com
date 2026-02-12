# Ralph Wiggum Loop — Single Iteration

Run a single Ralph iteration inline. This reads the current PRD, picks the next story, and implements it.

## How to use

1. Ensure `scripts/ralph/prd.json` exists (copy from `prd.json.example` and customise)
2. Run `/ralph` to execute one iteration

## Execution Process

1. **Read context**
   - Read `scripts/ralph/prd.json` for the current PRD
   - Read `progress.txt` (Codebase Patterns section first)
   - Read `AGENTS.md` for project conventions

2. **Select story**
   - Find the highest-priority user story where `passes: false`
   - If all stories have `passes: true`, report completion

3. **Implement**
   - Implement the selected story following its acceptance criteria
   - Follow all rules in `CLAUDE.md`
   - Work on this ONE story only

4. **Validate**
   - Run: `pnpm typecheck && pnpm lint && pnpm build`
   - Fix any failures before proceeding

5. **Commit & update**
   - Commit with: `feat: [Story ID] - [Story Title]`
   - Update `scripts/ralph/prd.json` to set `passes: true`
   - Append progress to `progress.txt`
   - Update `AGENTS.md` if you discovered reusable patterns

6. **Report**
   - Show which stories are done and which remain
   - If all complete, output `<promise>COMPLETE</promise>`
