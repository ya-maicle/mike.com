# Execution Plan: CI Main Pipeline with Staging & Production Promotion

**Name:** `13prp_ci_main_pipeline_staging_promote_EXECUTION_PLAN`
**PRP Reference:** [PRPs/13prp_ci_main_pipeline_staging_promote.md](PRPs/13prp_ci_main_pipeline_staging_promote.md)

## Purpose

This document provides a step-by-step guide to implement and refine the main branch CI/CD pipeline. It addresses critical blockers identified during the initial review, refactors the existing workflow to meet all success criteria, and outlines the necessary manual configuration in GitHub and Vercel.

---

## Phase 1: Pre-flight - Branching & Manual Configuration

_These steps are prerequisites and must be completed manually in the respective platforms before the workflow can succeed._

### Step 1.1: Create a New Feature Branch [COMPLETED]

Ensure your local `main` branch is up-to-date, then create a new branch for this task.

```bash
# 1. Go to the main branch
git checkout main

# 2. Pull the latest changes
git pull --rebase origin main

# 3. Create a new feature branch
git switch -c feat/cicd-main-pipeline-refinement
```

### Step 1.2: Configure GitHub Production Environment (Manual)

The manual approval gate requires a protected environment in GitHub.

1.  Navigate to your repository on GitHub.
2.  Go to **Settings > Environments > New environment**.
3.  Name the environment `production`.
4.  Click **Configure environment**.
5.  Under **Deployment protection rules**, check **Required reviewers**.
6.  Add yourself or the appropriate team/personnel as a reviewer.
7.  (Optional) Add a **Wait timer** (e.g., 10 minutes) for an extra safety buffer.
8.  Click **Save protection rules**.

### Step 1.3: Add Required Secrets to GitHub Actions (Manual)

The workflow requires API tokens and project identifiers to interact with Vercel and Supabase.

1.  Navigate to **Settings > Secrets and variables > Actions**.
2.  Ensure the following secrets are created with the correct values:
    - `VERCEL_TOKEN`: Your Vercel Personal Access Token.
    - `VERCEL_ORG_ID`: Your Vercel organization/team ID.
    - `VERCEL_PROJECT_ID`: The ID of the specific Vercel project.
    - `SUPABASE_ACCESS_TOKEN`: Your Supabase Personal Access Token.
    - `SUPABASE_STAGING_PROJECT_REF`: The project reference for your **staging** Supabase project.

### Step 1.4: Configure Vercel Project Settings (Manual)

To ensure the pipeline has full control over deployments:

1.  In your Vercel project dashboard, go to the **Domains** tab and add/verify `staging.mikeiu.com` and `mikeiu.com`.
2.  Go to the **Git** tab. Ensure the **Production Branch** is set to `main`, but **turn off** automatic deployments for this branch if the setting is available. This prevents Vercel from deploying independently and bypassing our manual approval gate. The `vercel promote` command will manage production deployments.

---

## Phase 2: Code Implementation & Workflow Refinement

### Step 2.1: Refactor `main.yml` for "Build Once, Deploy Twice"

Modify `.github/workflows/main.yml` to generate a single build artifact that is promoted across environments.

1.  **Quality Checks Job**:
    - Add a `vercel build` step to generate a prebuilt output.
    - Change the `upload-artifact` step to upload the `.vercel/output` directory instead of `.next`.
2.  **Staging Deployment Job**:
    - Remove the `vercel --force` command.
    - Add a step to download the `.vercel/output` artifact.
    - Deploy the artifact using `vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}`.
    - Capture the deployment URL from this command into a job output.
3.  **Production Promotion Job**:
    - Remove the `vercel list` command.
    - Use the deployment URL from the staging job's output (`needs.staging-deployment.outputs.deployment_url`) to promote the exact same build.

### Step 2.2: Correct Supabase CLI Commands in `main.yml`

Update the Supabase steps for correctness and clarity.

1.  **Staging Deployment Job**:
    - Correct the login command from `echo "..." | supabase auth login --token` to `supabase login`. The token should be passed via the `SUPABASE_ACCESS_TOKEN` environment variable, which the official `setup-cli` action uses automatically.
    - Ensure `db push` is executed after linking the project.

### Step 2.3: Ensure `jq` Dependency is Met

The workflow relies on `jq` to parse CLI output. Add an installation step to guarantee it's available on the runner.

1.  **Staging & Production Jobs**:
    - Add a step at the beginning of any job using `jq`:
      ```yaml
      - name: Install jq
        run: sudo apt-get update && sudo apt-get install -y jq
      ```

### Step 2.4: Verify and Refine Helper Scripts

The PRP mentions creating scripts that already exist. We will verify their content and ensure they are executable.

1.  Check `scripts/apply-migrations.sh`, `scripts/deploy-staging.sh`, and `scripts/promote-production.sh`.
2.  Ensure they are robust. Since the logic is now primarily in the `main.yml` workflow, these scripts may be simplified or removed if they are fully superseded by workflow steps. For this plan, we will keep the logic in the YAML file.
3.  Ensure the files have execute permissions: `chmod +x scripts/*.sh`.

---

## Phase 3: Documentation & Validation

### Step 3.1: Update Pipeline Documentation

Update `docs/operations/deployment-pipeline.md` to reflect the new, refined process.

1.  Document the manual setup steps from Phase 1.
2.  Explain the "build once, deploy twice" flow using prebuilt Vercel artifacts.
3.  Clarify that promotion is tied to a specific staging build URL.

### Step 3.2: Local Validation

Before committing, validate the workflow syntax.

```bash
# You may need to install the parser
npm install -g @github/actions-parser

# Run the parser against your workflow file
actions-parser -f .github/workflows/main.yml
```

---

## Phase 4: Pull Request & Merge

### Step 4.1: Commit and Push All Changes

Stage, commit, and push the refined workflow, updated documentation, and any script changes.

```bash
# 1. Add all changes
git add .github/workflows/main.yml docs/operations/deployment-pipeline.md scripts/

# 2. Commit with a conventional commit message
git commit -m "feat(ci): implement main pipeline with staging promotion gate"

# 3. Push the branch to the remote repository
git push -u origin feat/cicd-main-pipeline-refinement
```

### Step 4.2: Create the Pull Request

1.  Open a pull request on GitHub from your feature branch to `main`.
2.  **Title:** `feat(ci): Implement Main Pipeline with Staging Promotion Gate`
3.  **Description:**
    - Link to the original PRP: `Resolves #<issue_number_for_PRP_13>`.
    - Summarize the changes, including the workflow refactoring and documentation updates.
    - **Crucially, add a "Manual Setup Required" section** detailing the steps from Phase 1 for the reviewer/merger to verify.
4.  Assign reviewers and wait for the PR checks to pass.
5.  Once approved, merge the pull request. The new pipeline will be active on the next push to `main`.
