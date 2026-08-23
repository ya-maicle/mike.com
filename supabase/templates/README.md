# Auth email templates

These files are the source-controlled versions of the hosted Supabase Auth emails.
Supabase creates the magic link; Resend delivers the resulting message through the
project's SMTP integration.

## Editing

The shared frame and per-email content live in
`scripts/render-auth-email-templates.mjs`. Generate the HTML with:

```bash
pnpm email:templates
```

Run `pnpm email:templates:check` to confirm the committed output is current. Add
future auth messages to the `templates` array so they reuse the same brand,
spacing, typography, button, security notice, and footer.

## Hosted Supabase

For the production project, copy the subject and generated HTML into **Auth →
Email Templates → Magic Link** in the Supabase dashboard.

- Subject: `Sign in to mikeiu.com`
- Body: `supabase/templates/magic-link.html`

The hosted dashboard does not read this repository automatically. Keep Resend
link/open tracking disabled for auth messages because rewritten URLs can break
Supabase confirmation links. Supabase Auth caches hosted template bodies for up
to 10 minutes, so wait for that cache window before judging a live test send.

## Content rules

- Keep one clear primary action.
- Never expose environment labels such as `[prod]` to recipients.
- Link descriptive fallback text instead of printing the long one-time URL.
- Do not hard-code a copyright year. The yearless owner line stays accurate.
- Keep `{{ .ConfirmationURL }}` unchanged unless the application also adds and
  verifies a first-party token callback.
