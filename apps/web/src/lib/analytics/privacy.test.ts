import { describe, expect, it } from 'vitest'
import {
  sanitizeAnalyticsProperties,
  sanitizeAnalyticsUrl,
  sanitizePostHogEvent,
} from '@/lib/analytics/privacy'

describe('analytics privacy sanitization', () => {
  it('strips query strings and fragments from relative and absolute URLs', () => {
    expect(sanitizeAnalyticsUrl('/work/private?k=secret#details')).toBe('/work/private')
    expect(sanitizeAnalyticsUrl('https://mikeiu.com/login?code=oauth#done')).toBe(
      'https://mikeiu.com/login',
    )
  })

  it('removes credentials, emails, playback identifiers, and sensitive redirect data', () => {
    const result = sanitizeAnalyticsProperties({
      access_source: 'login',
      company_slug: 'example-company',
      email: 'person@example.com',
      nested: { oauth_code: 'secret', safe: 'retained' },
      playback_id: 'signed-playback',
      auth_return_to: '/work/private',
      label: 'Contact person@example.com',
    })

    expect(result).toEqual({
      access_source: 'login',
      company_slug: 'example-company',
      nested: { safe: 'retained' },
    })
  })

  it('sanitizes PostHog URL and referrer properties without changing safe event data', () => {
    const result = sanitizePostHogEvent({
      event: 'case_study_viewed',
      properties: {
        $current_url: 'https://mikeiu.com/work/private?k=secret',
        $referrer: 'https://google.com/search?q=portfolio',
        study_slug: 'private',
        access_source: 'link',
      },
      $set: { audience_type: 'authenticated_viewer', email: 'person@example.com' },
      $set_once: { auth_provider: 'google', access_token: 'secret' },
      $unset: ['safe_property', 'email'],
    })

    expect(result.properties).toEqual({
      $current_url: 'https://mikeiu.com/work/private',
      $referrer: 'https://google.com/search',
      study_slug: 'private',
      access_source: 'link',
    })
    expect(result.$set).toEqual({ audience_type: 'authenticated_viewer' })
    expect(result.$set_once).toEqual({ auth_provider: 'google' })
    expect(result.$unset).toEqual(['safe_property'])
  })
})
