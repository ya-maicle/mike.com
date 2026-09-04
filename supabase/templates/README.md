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

The shared layout uses a white canvas, the website's standalone logo mark,
generous spacing, a centered pill button, and one footer divider. The email-safe
PNG at `apps/web/public/email/logo-mark.png` is a 3× export of the exact path in
`apps/web/src/components/ui/logotype.tsx`, displayed at 72 × 41 pixels on desktop
and 48 pixels wide on mobile, preserving its proportions. It uses a
white background so the black mark remains legible when a mail client changes
the message background. Keep the accessible alt text when updating the image.

## Hosted Supabase

For every hosted project, copy the subject and generated HTML into both
**Auth → Email Templates → Confirm signup** and **Magic Link** in the Supabase
dashboard. A first-time email address receives Confirm signup because the login
form also creates accounts; an existing user receives Magic Link. Hosted Auth
configuration belongs to each Supabase project, so updating `mikeiu-staging`
does not update `mikeiu-prod`.

| Supabase template | Subject                 | Body                                   |
| ----------------- | ----------------------- | -------------------------------------- |
| Confirm signup    | `Sign in to mikeiu.com` | `supabase/templates/confirmation.html` |
| Magic Link        | `Sign in to mikeiu.com` | `supabase/templates/magic-link.html`   |

The hosted dashboard does not read this repository automatically, so repeat the
copy after every committed template change. Supabase Auth caches hosted template
bodies for up to 10 minutes; wait for that cache window before judging a live
test send.

Before publishing this design to either hosted project, deploy the logo asset
to `https://mikeiu.com/email/logo-mark.png` and verify that it loads. Both email
templates use this public production asset, including staging emails. The logo
is decorative branding; sign-in and the text fallback do not depend on images.

For the initial rollout, deploy the application with the fragment-aware
`/auth/confirm` page first, configure its exact redirect URL, and only then
replace the hosted template. Publishing the template first would send users to
a confirmation flow the deployed application cannot yet complete. The hosted
dashboard does not update when repository files are deployed. During that brief
deploy-to-template gap, the confirmation page also accepts the old template's
implicit session fragment (including providers that append a second `#`), so a
newly requested link still signs in safely.

The application always calls `signInWithOtp` with an `emailRedirectTo` shaped
like `https://<origin>/auth/confirm#auth_return_to=<encoded-safe-path>`. The
template uses `{{ .RedirectTo }}` and appends the exact suffix
`&amp;token_hash={{ .TokenHash }}&amp;type=email`, keeping the return path and
one-time credentials together in the fragment. Configure each environment in
its own Supabase dashboard:

| Deployment | Vercel scope | Supabase project | Site URL                     | Required redirect URL                                                         |
| ---------- | ------------ | ---------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| Preview    | Preview      | `mikeiu-staging` | `https://preview.mikeiu.com` | `https://preview.mikeiu.com/**` and `https://*-mikeiu-com.vercel.app/**`      |
| Production | Production   | `mikeiu-prod`    | `https://mikeiu.com`         | `https://mikeiu.com/auth/confirm`                                             |
| Local      | Development  | local Supabase   | `http://localhost:3000`      | `http://localhost:3000/auth/confirm` and `http://127.0.0.1:3000/auth/confirm` |

Do not use a broad production wildcard. If another canonical host is introduced,
add its exact `/auth/confirm` URL before sending a link from that host.

Promote the change in two independent passes:

1. Merge and deploy to Preview. In `mikeiu-staging`, verify the Preview Site URL
   and both redirect patterns, set Email OTP expiry to `1800`, then publish both
   templates and test new and existing email addresses across browsers.
2. Merge and deploy the tested Preview commit to Production. In `mikeiu-prod`,
   verify the production Site URL and redirect URL, set Email OTP expiry to
   `1800`, then publish both templates and test new and existing addresses.

Always deploy the application before publishing the corresponding hosted
template. Repository deployment alone does not change either Supabase project's
Auth settings.

## Magic-link security and lifecycle

The `token_hash` fragment is intentionally usable in a different browser or on
a different device from the one that requested the email. Possession of the
unexpired, one-time link is therefore sufficient to sign in, so treat its URL as
a secret and never send it to analytics. URL fragments are not included in the
initial navigation request or referrer headers, so neither the `token_hash` nor
return path reaches site, CDN, or proxy access logs. The `/auth/confirm` page
removes the fragment immediately, then waits for an explicit user click before
submitting the token directly to Supabase with the browser-side `verifyOtp`
exchange and persisting the session in the browser that opened the email. That
deliberate action prevents common email-security scanner GETs from spending the
one-time token before the recipient opens it. There is no `/auth/callback` route
in this flow.

Keep Resend link/open tracking disabled for auth messages: tracking rewrites
links and can break verification. The template promises a 30-minute lifetime,
so hosted Email OTP expiration must remain `1800` seconds. A link can be used
only once. The UI waits 60 seconds before offering resend; passwordless resends
call `signInWithOtp` again and expired or replayed links send the user back to
request a fresh one.

## Content rules

- Keep one clear primary action.
- Never expose environment labels such as `[prod]` to recipients.
- Link descriptive fallback text instead of printing the long one-time URL.
- Do not hard-code a copyright year. The yearless owner line stays accurate.
- Keep the action and fallback URLs identical. Both must retain
  `{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email` so verification
  remains on the first-party confirmation page with all credentials in the URL
  fragment.
