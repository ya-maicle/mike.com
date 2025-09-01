'use client'

import * as React from 'react'
import { Protected } from '@/components/protected'

export default function StoriesPage() {
  return (
    <Protected
      onUnauthed="modal"
      fallback={
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Stories</h1>
          <p className="text-muted-foreground">Sign in to access this content.</p>
        </div>
      }
    >
      <div className="space-y-10">
        <section className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Stories</h1>
          <p className="text-muted-foreground max-w-prose">
            Welcome back! You now have access to restricted stories.
          </p>
        </section>
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-32 rounded-lg border" />
          ))}
        </section>
      </div>
    </Protected>
  )
}
