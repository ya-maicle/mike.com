import 'server-only'

import { createClient } from '@supabase/supabase-js'

type PortfolioAccessEvent = {
  eventType: 'link_opened' | 'login_granted' | 'login_denied' | 'login_blocked'
  companySlug?: string | null
  grantType?: 'link' | 'login' | null
  path?: string | null
  userId?: string | null
  emailDomain?: string | null
}

type AccessEventsDatabase = {
  public: {
    Tables: {
      portfolio_access_events: {
        Row: {
          id: string
          event_type: PortfolioAccessEvent['eventType']
          company_slug: string | null
          grant_type: PortfolioAccessEvent['grantType']
          path: string | null
          user_id: string | null
          email_domain: string | null
          created_at: string
        }
        Insert: {
          event_type: PortfolioAccessEvent['eventType']
          company_slug?: string | null
          grant_type?: PortfolioAccessEvent['grantType']
          path?: string | null
          user_id?: string | null
          email_domain?: string | null
        }
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

let serviceClient: ReturnType<typeof createClient<AccessEventsDatabase>> | undefined

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null

  serviceClient ??= createClient<AccessEventsDatabase>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return serviceClient
}

export async function logPortfolioAccessEvent(event: PortfolioAccessEvent) {
  const supabase = getServiceClient()
  if (!supabase) return

  try {
    const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
    await supabase.from('portfolio_access_events').delete().lt('created_at', cutoff)
    await supabase.from('portfolio_access_events').insert({
      event_type: event.eventType,
      company_slug: event.companySlug ?? null,
      grant_type: event.grantType ?? null,
      path: event.path ?? null,
      user_id: event.userId ?? null,
      email_domain: event.emailDomain ?? null,
    })
  } catch {
    // Access logging is intentionally best-effort and must never block portfolio access.
  }
}
