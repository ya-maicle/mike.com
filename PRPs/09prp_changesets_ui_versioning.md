name: "Changesets for packages/ui Versioning - Phase 0.24"
description: |

## Purpose

Initialize Changesets for semantic versioning of the @maicle/ui design system package, enabling automated version management and future publishing workflows while maintaining separation from app deployment cycles.

## Core Principles

1. **Package isolation**: Version only packages/ui, skip apps for deployment-based versioning
2. **Semantic versioning**: Automated version bumps based on changeset declarations
3. **Future publishing**: Foundation for NPM publishing when design system goes public
4. **Documentation driven**: Clear process for contributors to declare changes
5. **Release automation**: Prepared for future automated release workflows

---

## Goal

Set up Changesets tooling to manage semantic versioning for @maicle/ui package with automated version bumping and change tracking, preparing the foundation for future design system publishing.

## Why

- **Design system evolution**: Track component changes and breaking changes systematically
- **Version consistency**: Automated semantic versioning prevents manual version errors
- **Future publishing**: Prepares package for public distribution when ready
- **Team collaboration**: Clear process for contributors to document changes
- **Release automation**: Foundation for automated NPM publishing workflows

## What

- Initialize Changesets configuration for packages/ui versioning
- Configure to exclude apps/web from versioning (apps use deployment-based versioning)
- Create sample changeset to demonstrate workflow
- Document changeset process in README for contributors
- Prepare release workflow foundation (not activated until publishing desired)

### Success Criteria

- [ ] Changesets initialized and configured for packages/ui only
- [ ] Configuration excludes apps/web from version management
- [ ] Sample changeset created and processed successfully
- [ ] Changeset version command generates correct version bumps
- [ ] Documentation added to README explaining changeset workflow
- [ ] Release workflow foundation created but not activated
- [ ] No impact on existing apps/web deployment flow

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://github.com/changesets/changesets
  why: Official Changesets documentation and setup guide

- url: https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md
  why: Introduction to changeset workflow and best practices

- file: packages/ui/package.json
  why: UI package configuration and current version

- file: package.json
  why: Root workspace configuration and scripts

- file: pnpm-workspace.yaml
  why: Workspace structure for changeset configuration

- file: docs/logs/phase-0-log.md
  why: Section 0.24 requirements for Changesets setup

- docfile: docs/product_requirements_document.md
  why: Design system requirements and component tiers

- url: https://github.com/changesets/changesets/blob/main/docs/config-file-options.md
  why: Configuration options for changeset behavior
```

### Current Codebase tree

```bash
mikeiu.com/
├── .github/
│   └── workflows/
│       └── pr.yml                    # REFERENCE: Existing workflows
├── apps/
│   └── web/
│       └── package.json              # EXCLUDE: App uses deployment versioning
├── packages/
│   ├── config/
│   │   └── package.json              # EXCLUDE: Internal config package
│   └── ui/
│       ├── package.json              # INCLUDE: Main target for versioning
│       ├── src/
│       │   └── components/           # Components that need version tracking
│       └── .storybook/               # Documentation affected by versions
├── package.json                      # MODIFY: Add changeset scripts
└── pnpm-workspace.yaml              # REFERENCE: Workspace structure
```

### Desired Codebase tree with files to be added

```bash
mikeiu.com/
├── .changeset/
│   ├── config.json                   # CREATE: Changeset configuration
│   └── readme.md                     # CREATE: Generated changeset docs
├── .github/
│   └── workflows/
│       ├── pr.yml                    # EXISTING: Current PR workflow
│       └── release.yml               # CREATE: Future release workflow (inactive)
├── packages/
│   └── ui/
│       ├── CHANGELOG.md              # GENERATED: Automated changelog
│       └── package.json              # MODIFIED: Version will be managed
├── package.json                      # MODIFY: Add changeset scripts
└── README.md                         # MODIFY: Document changeset workflow
```

### Known Gotchas of our codebase & Changesets Quirks

```bash
# CRITICAL: Workspace filtering in monorepo
# Configure changeset to only version packages/ui, not apps
# Apps use deployment-based versioning, not semantic versioning

# CRITICAL: pnpm workspace integration
# Ensure changeset respects pnpm workspace structure
# Use proper package manager detection

# GOTCHA: Version bump scope
# UI package should follow semver strictly
# Breaking changes must be clearly documented

# GOTCHA: Future publishing preparation
# Set up infrastructure but don't activate publishing yet
# Keep release workflow disabled until design system is stable

# PATTERN: Changeset workflow
# 1. Developer adds changeset for each PR with UI changes
# 2. Changeset accumulates changes until release
# 3. Version command creates version bump PR
# 4. Merge triggers release (when activated)

# PATTERN: Change types
# patch: Bug fixes, minor tweaks
# minor: New components, new props (backwards compatible)
# major: Breaking changes to component APIs
```

## Implementation Blueprint

### Data models and structure

```yaml
# Changeset Configuration Structure
CHANGESET_CONFIG:
  packages: ['packages/ui'] # Only version UI package
  excluded_packages: ['apps/*', 'packages/config']
  commit_messages:
    skipChangelog: ['ci', 'docs', 'chore']

# Package Versioning Strategy
VERSIONING_STRATEGY:
  packages/ui: 'semantic versioning with changesets'
  apps/web: 'deployment-based versioning (excluded)'
  packages/config: 'manual versioning (excluded)'

# Workflow Integration
WORKFLOW_STRUCTURE:
  pr_checks: 'Validate changeset exists for UI changes'
  release_prep: 'Automated version bump PR creation'
  release_publish: 'NPM publish (future activation)'
```

### List of tasks to be completed in order

```yaml
Task 1 - Initialize Changesets:
  RUN changeset initialization:
    - EXECUTE pnpm dlx @changesets/cli init
    - VERIFY .changeset directory created with config
    - REVIEW generated configuration file

Task 2 - Configure Package Scope:
  MODIFY .changeset/config.json:
    - SET packages to include only "packages/ui"
    - EXCLUDE apps and internal packages
    - CONFIGURE commit message and changelog settings
    - SET proper package manager to pnpm

Task 3 - Add Changeset Scripts:
  MODIFY package.json:
    - ADD changeset command for creating changesets
    - ADD version command for bumping versions
    - ADD publish command for future NPM publishing
    - CONFIGURE CI-friendly versions of commands

Task 4 - Create Sample Changeset:
  CREATE sample changeset:
    - RUN pnpm changeset to create example changeset
    - DEMONSTRATE patch/minor/major selection
    - PROVIDE clear change description
    - VERIFY changeset format and content

Task 5 - Test Version Workflow:
  RUN version bumping:
    - EXECUTE pnpm changeset version
    - VERIFY packages/ui/package.json version updated
    - VERIFY CHANGELOG.md generated correctly
    - CONFIRM no changes to apps/web

Task 6 - Document Workflow:
  MODIFY README.md:
    - ADD changeset workflow section
    - EXPLAIN when to add changesets
    - PROVIDE examples for different change types
    - DOCUMENT release process for maintainers

Task 7 - Prepare Release Workflow:
  CREATE .github/workflows/release.yml:
    - CONFIGURE changeset action for automated releases
    - SET UP NPM publishing (but keep inactive)
    - PREPARE for future activation when design system is stable
```

### Per task pseudocode

```bash
# Task 1: Initialize Changesets
pnpm dlx @changesets/cli init
# This creates .changeset/config.json and .changeset/README.md

# Task 2: Configure for UI package only
# File: .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["apps/*", "packages/config"]
}

# Task 3: Package Scripts Addition
# Addition to root package.json scripts:
{
  "changeset": "changeset",
  "changeset:version": "changeset version",
  "changeset:publish": "changeset publish",
  "changeset:status": "changeset status"
}

# Task 4: Sample Changeset Creation
pnpm changeset
# Interactive prompts:
# - Which packages to include? packages/ui
# - What type of change? patch/minor/major
# - Summary of changes

# Task 5: Version Bump Test
pnpm changeset version
# Expected results:
# - packages/ui/package.json version bumped
# - packages/ui/CHANGELOG.md created/updated
# - .changeset/*.md files consumed

# Task 7: Release Workflow Template
# File: .github/workflows/release.yml (inactive)
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    if: false  # Disabled until design system is ready
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - uses: changesets/action@v1
        with:
          publish: pnpm changeset:publish
          version: pnpm changeset:version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Integration Points

```yaml
PACKAGE_INTEGRATION:
  - target: packages/ui semantic versioning
  - exclusion: apps/web deployment-based versioning
  - changelog: Automated generation from changesets

WORKFLOW_INTEGRATION:
  - pr_workflow: Optional changeset validation for UI changes
  - release_workflow: Automated version bump and publish (future)
  - manual_process: Changeset creation and version management

DOCUMENTATION_INTEGRATION:
  - readme: Contributor workflow documentation
  - changelog: Automated change documentation
  - storybook: Version-aware component documentation
```

## Validation Loop

### Level 1: Changeset Configuration Validation

```bash
# Verify changeset initialization
ls -la .changeset/
cat .changeset/config.json

# Test changeset creation
pnpm changeset --empty

# Expected: Configuration file exists, changeset creation works
```

### Level 2: Version Workflow Testing

```bash
# Create a test changeset
echo "Test changeset for validation" | pnpm changeset --empty

# Run version command
pnpm changeset:version

# Verify version bump
grep '"version"' packages/ui/package.json
test -f packages/ui/CHANGELOG.md

# Expected: Version incremented, changelog created
```

### Level 3: Package Isolation Verification

```bash
# Verify only UI package is affected
pnpm changeset:status

# Check that apps are excluded
grep -q "apps/" .changeset/config.json && echo "ERROR: apps not excluded" || echo "OK: apps excluded"

# Verify workspace integration
pnpm --filter @maicle/ui version

# Expected: Only UI package participates in versioning
```

## Final validation Checklist

- [ ] Changesets initialized and configured correctly
- [ ] Configuration excludes apps/web and packages/config
- [ ] Sample changeset created and processed successfully
- [ ] Version command works and updates only packages/ui
- [ ] CHANGELOG.md generated correctly for UI package
- [ ] Package.json scripts added for changeset workflow
- [ ] README documentation explains changeset process
- [ ] Release workflow prepared but inactive
- [ ] No interference with apps/web deployment process

---

## Anti-Patterns to Avoid

- ❌ Don't include apps in changeset versioning - apps use deployment-based versions
- ❌ Don't activate publishing workflow until design system is stable
- ❌ Don't skip changeset documentation - contributors need clear guidance
- ❌ Don't version internal packages that don't need semantic versioning
- ❌ Don't create breaking changes without major version bumps
- ❌ Don't merge UI changes without appropriate changesets
- ❌ Don't manually edit version numbers - let changesets manage them
