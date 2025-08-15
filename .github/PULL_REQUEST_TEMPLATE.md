# Pull Request

## Summary

A concise summary of the change.

## Problem

What problem does this PR solve? Link the issue if applicable.

- Closes #ISSUE_ID

## Approach

Describe the approach taken and why. Call out trade-offs.

## Screenshots / Preview URL

- Vercel Preview: <insert preview URL>
- Screenshots (if UI change): <attach>

## Test Plan

How did you verify this change?

- [ ] Local `pnpm dev` works
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] `pnpm --filter @maicle/ui build-storybook` passes
- [ ] Unit tests (when added) pass
- [ ] E2E smoke (when enabled) passes on staging

## Risk / Rollback

- Risk level: Low / Medium / High
- Rollback: Revert commit. If DB or infra change, include compensating steps.

## Security Notes

- Secrets handled only in Vercel envs (no secrets in code)
- Webhooks/signatures unaffected
- Auth/RLS unaffected
- Any new scopes/keys? Explain why and where stored.

## ENV Changes

List any new or changed environment variables. Update `.env.example` and `ENVIRONMENT.md` accordingly.

- Example: `NEW_ENV_VAR`: purpose, envs

## Checklist

- [ ] Conventional commit message
- [ ] Linked issue (if applicable)
- [ ] Acceptance criteria met
- [ ] Documentation updated (README/ENVIRONMENT.md as needed)

## Notes for Reviewer

Anything else helpful for reviewing this PR.
