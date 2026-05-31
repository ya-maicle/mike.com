import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Icon } from './icon'
import * as Icons from './icons'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Badge } from './badge'
import React, { useState } from 'react'

const meta: Meta<typeof Icon> = {
  title: 'UI/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: Icons.Heart,
    size: 'md',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={Icons.Star} size="sm" />
      <Icon icon={Icons.Star} size="md" />
      <Icon icon={Icons.Star} size="lg" />
      <Icon icon={Icons.Star} size="xl" />
      <Icon icon={Icons.Star} size={48} />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={Icons.Heart} className="text-destructive" />
      <Icon icon={Icons.Heart} className="text-success" />
      <Icon icon={Icons.Heart} className="text-info" />
      <Icon icon={Icons.Heart} className="text-accent" />
      <Icon icon={Icons.Heart} className="text-warning" />
      <Icon icon={Icons.Heart} className="text-accent" />
    </div>
  ),
}

// Navigation Icons
export const NavigationIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {[
        { icon: Icons.ChevronLeft, name: 'ChevronLeft' },
        { icon: Icons.ChevronRight, name: 'ChevronRight' },
        { icon: Icons.ChevronUp, name: 'ChevronUp' },
        { icon: Icons.ChevronDown, name: 'ChevronDown' },
        { icon: Icons.ArrowLeft, name: 'ArrowLeft' },
        { icon: Icons.ArrowRight, name: 'ArrowRight' },
        { icon: Icons.ArrowUp, name: 'ArrowUp' },
        { icon: Icons.ArrowDown, name: 'ArrowDown' },
        { icon: Icons.Menu, name: 'Menu' },
        { icon: Icons.X, name: 'Close' },
        { icon: Icons.Plus, name: 'Plus' },
        { icon: Icons.Minus, name: 'Minus' },
      ].map((item) => (
        <div key={item.name} className="flex flex-col items-center gap-2">
          <Icon icon={item.icon} size="lg" />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  ),
}

// Action Icons
export const ActionIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {[
        { icon: Icons.Search, name: 'Search' },
        { icon: Icons.Filter, name: 'Filter' },
        { icon: Icons.Download, name: 'Download' },
        { icon: Icons.Upload, name: 'Upload' },
        { icon: Icons.Copy, name: 'Copy' },
        { icon: Icons.Share, name: 'Share' },
        { icon: Icons.Edit, name: 'Edit' },
        { icon: Icons.Trash, name: 'Trash' },
        { icon: Icons.Save, name: 'Save' },
        { icon: Icons.Refresh, name: 'Refresh' },
        { icon: Icons.Undo, name: 'Undo' },
        { icon: Icons.Redo, name: 'Redo' },
      ].map((item) => (
        <div key={item.name} className="flex flex-col items-center gap-2">
          <Icon icon={item.icon} size="lg" />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  ),
}

// Status Icons
export const StatusIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {[
        { icon: Icons.Check, name: 'Check', color: 'text-success' },
        { icon: Icons.CheckCircle, name: 'CheckCircle', color: 'text-success' },
        { icon: Icons.AlertCircle, name: 'AlertCircle', color: 'text-warning' },
        { icon: Icons.AlertTriangle, name: 'AlertTriangle', color: 'text-warning' },
        { icon: Icons.XCircle, name: 'XCircle', color: 'text-destructive' },
        { icon: Icons.Info, name: 'Info', color: 'text-info' },
        { icon: Icons.HelpCircle, name: 'HelpCircle', color: 'text-muted-foreground' },
        { icon: Icons.Spinner, name: 'Spinner', color: 'text-info animate-spin' },
      ].map((item) => (
        <div key={item.name} className="flex flex-col items-center gap-2">
          <Icon icon={item.icon} size="lg" className={item.color} />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  ),
}

// User & Account Icons
export const UserIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {[
        { icon: Icons.User, name: 'User' },
        { icon: Icons.Users, name: 'Users' },
        { icon: Icons.UserPlus, name: 'UserPlus' },
        { icon: Icons.UserMinus, name: 'UserMinus' },
        { icon: Icons.Settings, name: 'Settings' },
        { icon: Icons.Crown, name: 'Crown' },
        { icon: Icons.Shield, name: 'Shield' },
        { icon: Icons.Key, name: 'Key' },
        { icon: Icons.Lock, name: 'Lock' },
        { icon: Icons.Unlock, name: 'Unlock' },
      ].map((item) => (
        <div key={item.name} className="flex flex-col items-center gap-2">
          <Icon icon={item.icon} size="lg" />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  ),
}

// Theme Icons
export const ThemeIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {[
        { icon: Icons.Sun, name: 'Sun', color: 'text-warning' },
        { icon: Icons.Moon, name: 'Moon', color: 'text-info' },
        { icon: Icons.Monitor, name: 'Monitor', color: 'text-muted-foreground' },
        { icon: Icons.Eye, name: 'Eye' },
        { icon: Icons.EyeOff, name: 'EyeOff' },
        { icon: Icons.Palette, name: 'Palette', color: 'text-accent' },
      ].map((item) => (
        <div key={item.name} className="flex flex-col items-center gap-2">
          <Icon icon={item.icon} size="lg" className={item.color} />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  ),
}

// Interactive Examples
export const IconButtons: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button size="sm">
        <Icon icon={Icons.Plus} size="sm" />
      </Button>
      <Button variant="outline">
        <Icon icon={Icons.Download} size="sm" />
        Download
      </Button>
      <Button variant="destructive">
        <Icon icon={Icons.Trash} size="sm" />
        Delete
      </Button>
      <Button variant="ghost" size="icon">
        <Icon icon={Icons.Settings} size="sm" />
      </Button>
      <Button variant="secondary">
        Save
        <Icon icon={Icons.Save} size="sm" />
      </Button>
    </div>
  ),
}

export const IconWithInput: Story = {
  render: () => (
    <div className="max-w-sm space-y-4">
      <div className="relative">
        <Icon
          icon={Icons.Search}
          size="sm"
          className="absolute left-2.5 top-2.5 text-muted-foreground"
        />
        <Input placeholder="Search..." className="pl-9" />
      </div>
      <div className="relative">
        <Icon
          icon={Icons.Mail}
          size="sm"
          className="absolute left-2.5 top-2.5 text-muted-foreground"
        />
        <Input type="email" placeholder="Email" className="pl-9" />
      </div>
      <div className="relative">
        <Icon
          icon={Icons.Lock}
          size="sm"
          className="absolute left-2.5 top-2.5 text-muted-foreground"
        />
        <Input type="password" placeholder="Password" className="pl-9" />
      </div>
    </div>
  ),
}

export const IconGrid: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('')

    const allIcons = [
      // Navigation
      { icon: Icons.ChevronLeft, name: 'ChevronLeft', category: 'Navigation' },
      { icon: Icons.ChevronRight, name: 'ChevronRight', category: 'Navigation' },
      { icon: Icons.ChevronUp, name: 'ChevronUp', category: 'Navigation' },
      { icon: Icons.ChevronDown, name: 'ChevronDown', category: 'Navigation' },
      { icon: Icons.ArrowLeft, name: 'ArrowLeft', category: 'Navigation' },
      { icon: Icons.ArrowRight, name: 'ArrowRight', category: 'Navigation' },
      { icon: Icons.Menu, name: 'Menu', category: 'Navigation' },
      { icon: Icons.X, name: 'Close', category: 'Navigation' },

      // Actions
      { icon: Icons.Search, name: 'Search', category: 'Actions' },
      { icon: Icons.Download, name: 'Download', category: 'Actions' },
      { icon: Icons.Upload, name: 'Upload', category: 'Actions' },
      { icon: Icons.Copy, name: 'Copy', category: 'Actions' },
      { icon: Icons.Edit, name: 'Edit', category: 'Actions' },
      { icon: Icons.Trash, name: 'Trash', category: 'Actions' },
      { icon: Icons.Share, name: 'Share', category: 'Actions' },
      { icon: Icons.Save, name: 'Save', category: 'Actions' },

      // Status
      { icon: Icons.Check, name: 'Check', category: 'Status' },
      { icon: Icons.CheckCircle, name: 'CheckCircle', category: 'Status' },
      { icon: Icons.AlertCircle, name: 'AlertCircle', category: 'Status' },
      { icon: Icons.XCircle, name: 'XCircle', category: 'Status' },
      { icon: Icons.Info, name: 'Info', category: 'Status' },
      { icon: Icons.HelpCircle, name: 'HelpCircle', category: 'Status' },

      // User
      { icon: Icons.User, name: 'User', category: 'User' },
      { icon: Icons.Users, name: 'Users', category: 'User' },
      { icon: Icons.Settings, name: 'Settings', category: 'User' },
      { icon: Icons.Lock, name: 'Lock', category: 'User' },

      // Theme
      { icon: Icons.Sun, name: 'Sun', category: 'Theme' },
      { icon: Icons.Moon, name: 'Moon', category: 'Theme' },
      { icon: Icons.Monitor, name: 'Monitor', category: 'Theme' },
      { icon: Icons.Eye, name: 'Eye', category: 'Theme' },
      { icon: Icons.EyeOff, name: 'EyeOff', category: 'Theme' },

      // Communication
      { icon: Icons.Mail, name: 'Mail', category: 'Communication' },
      { icon: Icons.MessageCircle, name: 'MessageCircle', category: 'Communication' },
      { icon: Icons.Bell, name: 'Bell', category: 'Communication' },
      { icon: Icons.Send, name: 'Send', category: 'Communication' },
    ]

    const filteredIcons = allIcons.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Icon Library</CardTitle>
          <CardDescription>Browse and search through available icons</CardDescription>
          <div className="relative">
            <Icon
              icon={Icons.Search}
              size="sm"
              className="absolute left-2.5 top-2.5 text-muted-foreground"
            />
            <Input
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-4">
            {filteredIcons.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigator.clipboard.writeText(`<Icon icon={Icons.${item.name}} />`)}
              >
                <Icon icon={item.icon} size="lg" />
                <span className="text-xs font-medium">{item.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No icons found matching &quot;{searchTerm}&quot;
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
}
