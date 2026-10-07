'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AccessRequestDetails } from '@/lib/portfolio-request-model'

type Props = {
  value: AccessRequestDetails
  onChange: (value: AccessRequestDetails) => void
  disabled?: boolean
}

export function PortfolioRequestFields({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-4 text-left">
      <div className="space-y-2">
        <Label htmlFor="access-company">Company or affiliation</Label>
        <Input
          id="access-company"
          name="company"
          autoComplete="organization"
          required
          minLength={2}
          maxLength={120}
          value={value.company}
          disabled={disabled}
          aria-describedby="access-company-help"
          onChange={(event) => onChange({ ...value, company: event.target.value })}
        />
        <p id="access-company-help" className="text-sm text-muted-foreground">
          Your company, or something like “Independent designer” or “Student”.
        </p>
      </div>
      <details className="space-y-4">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Add a role or note (optional)
        </summary>
        <div className="space-y-2">
          <Label htmlFor="access-role">Role (optional)</Label>
          <Input
            id="access-role"
            name="role"
            autoComplete="organization-title"
            maxLength={120}
            value={value.role}
            disabled={disabled}
            onChange={(event) => onChange({ ...value, role: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="access-reason">Note (optional)</Label>
          <Textarea
            id="access-reason"
            name="reason"
            maxLength={1000}
            rows={3}
            value={value.reason}
            disabled={disabled}
            onChange={(event) => onChange({ ...value, reason: event.target.value })}
            placeholder="Anything you’d like me to know about your interest in the work."
          />
        </div>
      </details>
    </div>
  )
}
