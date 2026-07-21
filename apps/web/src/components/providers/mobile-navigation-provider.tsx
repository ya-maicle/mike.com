'use client'

import * as React from 'react'

interface MobileNavigationContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const MobileNavigationContext = React.createContext<MobileNavigationContextValue | undefined>(
  undefined,
)

export function MobileNavigationProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo(() => ({ open, setOpen }), [open])

  return (
    <MobileNavigationContext.Provider value={value}>{children}</MobileNavigationContext.Provider>
  )
}

export function useMobileNavigation() {
  const context = React.useContext(MobileNavigationContext)
  if (!context) {
    throw new Error('useMobileNavigation must be used within MobileNavigationProvider')
  }
  return context
}
