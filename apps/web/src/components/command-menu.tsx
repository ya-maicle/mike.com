'use client'

import * as React from 'react'
import { Calendar, Calculator, Search, User, Briefcase, BookOpen } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useRouter } from 'next/navigation'

type CommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => router.push('/work')}>
            <Briefcase className="size-4" />
            Work
          </CommandItem>
          <CommandItem onSelect={() => router.push('/biography')}>
            <User className="size-4" />
            Biography
          </CommandItem>
          <CommandItem onSelect={() => router.push('/stories')}>
            <BookOpen className="size-4" />
            Stories
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="size-4" />
            Calendar
          </CommandItem>
          <CommandItem>
            <Search className="size-4" />
            Search Emoji
          </CommandItem>
          <CommandItem>
            <Calculator className="size-4" />
            Calculator
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

