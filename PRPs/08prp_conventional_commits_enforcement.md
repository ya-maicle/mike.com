name: "Conventional Commits Enforcement (Lightweight) - Phase 0.23"
description: |

## Purpose

Implement lightweight conventional commit enforcement to maintain clean, consistent commit history that supports Changesets versioning and provides clear project evolution tracking.

## Core Principles

1. **Lightweight enforcement**: Educate and guide rather than strict blocking
2. **Developer workflow**: Minimal friction while maintaining standards
3. **Changeset preparation**: Clean history to support automated versioning
4. **Team consistency**: Standardized commit message format across contributors
5. **Optional automation**: Choose between documentation-only or CI enforcement

---

## Goal

Establish conventional commit standards through documentation and optional lightweight CI enforcement, creating a foundation for clean project history and automated versioning workflows.

## Why

- **Project history**: Clean, searchable commit history for debugging and reviews
- **Changeset support**: Consistent history enables automated version bumping
- **Team alignment**: Shared understanding of commit message standards
- **Future automation**: Foundation for release note generation and versioning

## What

- Document conventional commit standards in README with examples
- Optionally add commitlint with @commitlint/config-conventional
- Create lightweight GitHub Action check for commit message validation
- Provide clear examples of feat/fix/chore scopes already used in project
- Configure enforcement level based on team preference

### Success Criteria

- [ ] README updated with conventional commit examples and standards
- [ ] Commit message format documented with feat/fix/chore patterns
- [ ] Optional commitlint configuration available for teams wanting enforcement
- [ ] GitHub Action created for optional CI commit validation
- [ ] Examples show scope patterns consistent with existing project commits
- [ ] Documentation provides clear guidance for contributors
- [ ] Enforcement approach chosen (documentation-only or CI validation)

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://www.conventionalcommits.org/
  why: Official conventional commits specification and standards

- url: https://github.com/conventional-changelog/commitlint
  why: Commitlint setup and configuration options

- file: README.md
  why: Current documentation to extend with commit standards

- file: docs/logs/phase-0-log.md
  why: Examples of existing commit patterns used in project

- url: https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional
  why: Conventional config rules and scope definitions

- file: .github/workflows/pr.yml
  why: Existing PR workflow for optional commit validation integration

- docfile: docs/product_requirements_document.md
  why: PRD section 4.1 delivery strategy and commit conventions
```

### Current Codebase tree

```bash
mikeiu.com/
├── .github/
│   └── workflows/
│       └── pr.yml                    # MODIFY: Optional commit check
├── README.md                         # MODIFY: Add commit standards
└── package.json                      # MODIFY: Optional commitlint setup
```

### Desired Codebase tree with files to be added/modified

```bash
mikeiu.com/
├── .github/
│   └── workflows/
│       └── pr.yml                    # MODIFY: Optional commit validation
├── .commitlintrc.json                # CREATE: Optional commitlint config
├── README.md                         # MODIFY: Add commit standards section
└── package.json                      # MODIFY: Optional commitlint dependencies
```

### Known Gotchas of our codebase & Conventional Commits

```bash
# PATTERN: Existing commit patterns in project
# feat(phase-0): complete Sanity CMS setup
# fix(ci): standardize eslint versions across monorepo
# chore(deps): update pnpm-lock.yaml

# GOTCHA: Scope consistency
# Use consistent scopes: phase-0, ci, deps, ui, web, docs
# Avoid one-off scopes that don't align with project structure

# GOTCHA: Breaking changes
# Use ! or BREAKING CHANGE: footer for breaking changes
# Important for future semver automation

# PATTERN: Common types for this project
# feat: new features and capabilities
# fix: bug fixes and corrections
# chore: maintenance, deps, tooling
# docs: documentation updates
# ci: CI/CD pipeline changes

# OPTIONAL: Enforcement levels
# 1. Documentation only (recommended start)
# 2. Warning in CI (educate without blocking)
# 3. Error in CI (strict enforcement)
```

## Implementation Blueprint

### Data models and structure

```yaml
# Conventional Commit Format
COMMIT_FORMAT: '<type>[optional scope]: <description>'

# Project-Specific Types
COMMIT_TYPES:
  feat: 'New features and capabilities'
  fix: 'Bug fixes and corrections'
  chore: 'Maintenance, dependencies, tooling'
  docs: 'Documentation updates'
  ci: 'CI/CD pipeline changes'
  refactor: 'Code refactoring without feature changes'
  test: 'Test additions or modifications'

# Project Scopes (based on existing patterns)
SCOPES:
  phase-0: 'Phase 0 infrastructure setup'
  ci: 'Continuous integration'
  deps: 'Dependencies'
  ui: 'UI package changes'
  web: 'Web app changes'
  docs: 'Documentation'

# Enforcement Options
ENFORCEMENT_LEVELS:
  documentation: 'README guidance only'
  warning: 'CI warning without blocking'
  error: 'CI error blocking merge'
```

### List of tasks to be completed in order

```yaml
Task 1 - Document Commit Standards:
  MODIFY README.md:
    - ADD conventional commits section
    - INCLUDE examples based on existing project patterns
    - DOCUMENT scope guidelines and type definitions
    - PROVIDE clear guidance for contributors

Task 2 - Create Optional Commitlint Configuration:
  CREATE .commitlintrc.json:
    - CONFIGURE conventional commit rules
    - DEFINE allowed types and scopes
    - SET UP for optional team adoption

  MODIFY package.json (optional):
    - ADD commitlint dependencies for teams wanting enforcement
    - INCLUDE husky integration for local validation

Task 3 - Add Optional GitHub Action:
  CREATE .github/workflows/commitlint.yml OR modify pr.yml:
    - ADD commit message validation step
    - CONFIGURE as warning or error based on preference
    - PROVIDE clear feedback on commit message format

Task 4 - Provide Implementation Examples:
  DOCUMENT in README:
    - SHOW good vs bad commit message examples
    - EXPLAIN scope selection guidelines
    - PROVIDE quick reference for common scenarios

Task 5 - Choose Enforcement Approach:
  DECIDE implementation level:
    - OPTION A: Documentation only (lightweight start)
    - OPTION B: CI warnings (educational)
    - OPTION C: CI errors (strict enforcement)
```

### Per task pseudocode

```markdown
# Task 1: README Documentation Addition

## Commit Message Standards

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit history.

### Format
```

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

````

### Types
- `feat`: New features and capabilities
- `fix`: Bug fixes and corrections
- `chore`: Maintenance, dependencies, tooling
- `docs`: Documentation updates
- `ci`: CI/CD pipeline changes

### Scopes (based on project structure)
- `phase-0`: Phase 0 infrastructure setup
- `ci`: Continuous integration
- `deps`: Dependencies
- `ui`: UI package (`packages/ui`)
- `web`: Web app (`apps/web`)
- `docs`: Documentation

### Examples
```bash
# Good examples
feat(phase-0): add Sanity CMS integration
fix(ci): resolve eslint version conflicts
chore(deps): update Next.js to v15.4.6
docs: update environment setup instructions

# Breaking change
feat(auth)!: implement new authentication flow
````

# Task 2: Optional Commitlint Configuration

# File: .commitlintrc.json

{
"extends": ["@commitlint/config-conventional"],
"rules": {
"type-enum": [
2,
"always",
["feat", "fix", "chore", "docs", "ci", "refactor", "test"]
],
"scope-enum": [
1,
"always",
["phase-0", "ci", "deps", "ui", "web", "docs"]
],
"scope-empty": [1, "never"],
"subject-case": [2, "never", "upper-case"]
}
}

# Task 3: Optional GitHub Action

# Addition to .github/workflows/pr.yml or separate file

commitlint:
name: "Validate Commit Messages"
runs-on: ubuntu-latest
if: github.event_name == 'pull_request'
steps: - uses: actions/checkout@v4
with:
fetch-depth: 0

    - name: Validate commit messages
      uses: wagoid/commitlint-github-action@v5
      with:
        configFile: '.commitlintrc.json'
        failOnWarnings: false  # Set to true for strict enforcement

````

### Integration Points

```yaml
DOCUMENTATION_INTEGRATION:
  - readme: Commit standards section
  - examples: Based on existing project patterns
  - onboarding: Clear contributor guidance

OPTIONAL_AUTOMATION:
  - commitlint: Local and CI validation
  - husky: Pre-commit hooks for immediate feedback
  - github_actions: PR-based validation

CHANGESET_PREPARATION:
  - clean_history: Enables automated version bumping
  - semantic_versioning: Foundation for semver automation
  - release_notes: Structured commits for change documentation

TEAM_ADOPTION:
  - flexible: Teams can choose enforcement level
  - educational: Warning mode for learning
  - strict: Error mode for established teams
````

## Validation Loop

### Level 1: Documentation Validation

```bash
# Review README commit standards section
grep -A 20 "Commit Message Standards" README.md

# Validate examples against existing commit history
git log --oneline -10

# Expected: Clear documentation with relevant examples
```

### Level 2: Optional Commitlint Testing

```bash
# If commitlint is installed, test configuration
echo "feat(test): validate commitlint setup" | pnpm exec commitlint

# Test various commit message formats
echo "invalid commit message" | pnpm exec commitlint
echo "feat(ui): add new button component" | pnpm exec commitlint

# Expected: Proper validation of commit message format
```

### Level 3: Integration Validation

```bash
# If GitHub Action is configured, test with sample PR
# Create test commit with proper format
git commit -m "feat(test): validate conventional commit enforcement"

# Create test commit with improper format
git commit -m "bad commit message format"

# Expected: CI feedback reflects chosen enforcement level
```

## Final validation Checklist

- [ ] README includes clear commit message standards documentation
- [ ] Examples reflect actual project patterns and structure
- [ ] Scope guidelines align with monorepo organization
- [ ] Optional commitlint configuration available for team adoption
- [ ] GitHub Action configured for chosen enforcement level
- [ ] Documentation provides quick reference for contributors
- [ ] Enforcement approach matches team preferences and workflow
- [ ] Foundation established for future Changeset integration

---

## Anti-Patterns to Avoid

- ❌ Don't create overly strict enforcement that blocks developer productivity
- ❌ Don't use scopes that don't align with project structure
- ❌ Don't skip documentation - enforcement without education frustrates teams
- ❌ Don't ignore existing commit patterns - build on current practices
- ❌ Don't create complex rules that are hard to remember
- ❌ Don't enforce without providing clear examples and guidance
- ❌ Don't choose enforcement level without team consensus
