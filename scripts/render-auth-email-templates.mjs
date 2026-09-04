import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const checkOnly = process.argv.includes('--check')
const root = resolve(import.meta.dirname, '..')

const brand = {
  name: 'Mike Iukhtenko',
  siteName: 'mikeiu.com',
  siteUrl: '{{ .SiteURL }}',
  logoUrl: 'https://mikeiu.com/email/logo-mark.png',
  location: 'London, United Kingdom',
}

const templates = [
  {
    file: 'supabase/templates/confirmation.html',
    preview: 'Confirm your email to finish signing in to mikeiu.com.',
    title: 'Confirm your email for mikeiu.com',
    introduction:
      'Confirm your email address to finish creating your account and sign in to the website.',
    action: {
      href: '{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email',
      label: 'Confirm and sign in',
    },
    fallback: {
      href: '{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email',
      label: 'open the confirmation page',
    },
    securityNote:
      'If you didn’t request this email, you can safely ignore it. For your security, please don’t forward or share this link.',
  },
  {
    file: 'supabase/templates/magic-link.html',
    preview: 'Your secure sign-in link for mikeiu.com expires in 30 minutes.',
    title: 'Sign in to mikeiu.com',
    introduction: 'Use the button below to securely sign in to the website.',
    action: {
      href: '{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email',
      label: 'Sign in to the website',
    },
    fallback: {
      href: '{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=email',
      label: 'open the sign-in page',
    },
    securityNote:
      'If you didn’t request this email, you can safely ignore it. For your security, please don’t forward or share this link.',
  },
]

function renderEmail({ preview, title, introduction, action, fallback, securityNote }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${title}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-content { padding: 40px 24px !important; }
        .email-brand { padding-bottom: 48px !important; }
        .email-logo { width: 48px !important; height: auto !important; }
        .email-introduction { font-size: 17px !important; line-height: 28px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff; color: #18181b;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
      ${preview}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width: 100%; background-color: #ffffff;">
      <tr>
        <td align="center">
          <!--[if mso]><table role="presentation" width="624" align="center"><tr><td><![endif]-->
          <table class="email-shell" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 624px;">
            <tr>
              <td class="email-content" style="padding: 72px 32px 48px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="email-brand" style="padding: 0 0 64px;">
                      <a href="${brand.siteUrl}" style="display: inline-block; color: #18181b; text-decoration: none;">
                        <img class="email-logo" src="${brand.logoUrl}" width="72" height="41" alt="${brand.name}" style="display: block; width: 72px; height: 41px; border: 0;" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-introduction" style="padding: 0 0 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 29px; color: #18181b;">
                      ${introduction}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0 0 40px;">
                      <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" bgcolor="#18181b" style="border-radius: 999px; mso-padding-alt: 15px 30px;">
                            <a href="${action.href}" style="display: inline-block; padding: 15px 30px; border: 1px solid #18181b; border-radius: 999px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 500; line-height: 22px; color: #ffffff; text-align: center; text-decoration: none; mso-padding-alt: 0;">
                              ${action.label}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 26px; color: #18181b;">
                      This link expires in 30 minutes and can only be used once.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 26px; color: #52525b;">
                      ${securityNote}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 48px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 21px; color: #71717a;">
                      If the button doesn’t work, <a href="${fallback.href}" style="color: #52525b; text-decoration: underline; text-underline-offset: 3px;">${fallback.label}</a>.
                    </td>
                  </tr>
                  <tr>
                    <td class="email-footer" align="center" style="padding: 28px 0 0; border-top: 1px solid #e4e4e7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 20px; color: #71717a;">
                      ${brand.name}<br />
                      ${brand.location} &nbsp;·&nbsp; <a href="${brand.siteUrl}" style="color: #71717a; text-decoration: none;">${brand.siteName}</a><br />
                      <span style="overflow-wrap: anywhere; word-break: break-word;">Sent to {{ .Email }}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
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
