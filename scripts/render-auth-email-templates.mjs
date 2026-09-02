import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const checkOnly = process.argv.includes('--check')
const root = resolve(import.meta.dirname, '..')

const brand = {
  name: 'Mike Iukhtenko',
  siteName: 'mikeiu.com',
  siteUrl: '{{ .SiteURL }}',
  logoUrl: 'https://mikeiu.com/apple-icon.png',
  location: 'London, United Kingdom',
}

const templates = [
  {
    file: 'supabase/templates/confirmation.html',
    preview: 'Confirm your email to finish signing in to mikeiu.com.',
    eyebrow: 'Confirm your email',
    title: 'Finish signing in',
    introduction:
      'Confirm this email address to create your account and sign in. This link expires in 30 minutes and can only be used once.',
    action: {
      href: '{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email',
      label: 'Confirm and sign in',
    },
    fallback: {
      href: '{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email',
      label: 'open the secure confirmation page',
    },
    securityNote:
      'If you didn’t request this email, you can safely ignore it. For your security, never forward this confirmation link.',
  },
  {
    file: 'supabase/templates/magic-link.html',
    preview: 'Your secure sign-in link for mikeiu.com expires in 30 minutes.',
    eyebrow: 'Secure sign-in',
    title: 'Sign in to mikeiu.com',
    introduction:
      'Use the button below to sign in to the website. This link expires in 30 minutes and can only be used once.',
    action: {
      href: '{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email',
      label: 'Sign in securely',
    },
    fallback: {
      href: '{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email',
      label: 'open the secure sign-in page',
    },
    securityNote:
      'If you didn’t request this email, you can safely ignore it. For your security, never forward this sign-in link.',
  },
]

function renderEmail({ preview, eyebrow, title, introduction, action, fallback, securityNote }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${title}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { width: 100% !important; }
        .email-card { padding: 36px 24px !important; }
        .email-footer { padding: 24px !important; }
        .email-title { font-size: 30px !important; line-height: 36px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f5; color: #18181b;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
      ${preview}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background-color: #f4f4f5;">
      <tr>
        <td align="center" style="padding: 40px 16px;">
          <table class="email-shell" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 600px; max-width: 600px;">
            <tr>
              <td class="email-card" style="padding: 48px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 0 0 40px;">
                      <a href="${brand.siteUrl}" style="display: inline-block; text-decoration: none;">
                        <img src="${brand.logoUrl}" width="44" height="44" alt="${brand.name}" style="display: block; width: 44px; height: 44px; border: 0; border-radius: 11px;" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; line-height: 16px; letter-spacing: 1.4px; text-transform: uppercase; color: #71717a;">
                      ${eyebrow}
                    </td>
                  </tr>
                  <tr>
                    <td class="email-title" style="padding: 0 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 600; line-height: 42px; letter-spacing: -1px; color: #18181b;">
                      ${title}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px; color: #52525b;">
                      ${introduction}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 32px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td bgcolor="#18181b" style="border-radius: 999px;">
                            <a href="${action.href}" style="display: inline-block; padding: 14px 24px; border: 1px solid #18181b; border-radius: 999px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 20px; color: #ffffff; text-decoration: none;">
                              ${action.label}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; color: #71717a;">
                      If the button doesn’t open, <a href="${fallback.href}" style="color: #3f3f46; font-weight: 600; text-decoration: underline; text-decoration-color: #a1a1aa; text-underline-offset: 3px;">${fallback.label}</a>.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; color: #52525b;">
                      ${securityNote}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-footer" align="center" style="padding: 28px 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 19px; color: #71717a;">
                This sign-in request was sent to {{ .Email }}.<br />
                ${brand.location} &nbsp;·&nbsp; <a href="${brand.siteUrl}" style="color: #52525b; text-decoration: underline; text-decoration-color: #a1a1aa; text-underline-offset: 3px;">${brand.siteName}</a><br />
                © ${brand.name}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}

let hasChanges = false

for (const template of templates) {
  const path = resolve(root, template.file)
  const html = renderEmail(template)
  let current = ''

  try {
    current = await readFile(path, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  if (current === html) continue
  hasChanges = true

  if (checkOnly) {
    console.error(`${template.file} is not up to date`)
    continue
  }

  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, html)
  console.log(`Rendered ${template.file}`)
}

if (checkOnly && hasChanges) process.exitCode = 1
if (checkOnly && !hasChanges) console.log('Auth email templates are up to date')
