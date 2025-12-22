import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useFeatureFlag(flag: string, value: string = 'true'): boolean {
  const searchParams = useSearchParams()
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Check URL params
    if (searchParams.get(flag) === value) {
      setIsEnabled(true)
      return
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`feature_${flag}`)
      if (stored === value) {
        setIsEnabled(true)
      }
    }
  }, [searchParams, flag, value])

  return isEnabled
}
