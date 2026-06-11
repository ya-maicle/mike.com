/**
 * Root Sanity config for CLI usage (`pnpm sanity:dev|build|deploy`).
 *
 * Single source of truth is the embedded studio config — the two copies had
 * already drifted once (the root copy was missing the Programs section).
 */
export { default } from './apps/web/src/app/studio/sanity.config'
