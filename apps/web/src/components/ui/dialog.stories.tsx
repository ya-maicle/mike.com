import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Icon } from './icon'
import * as Icons from './icons'
import * as React from 'react'

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const EditProfile: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" defaultValue="@peduarte" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Confirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>
            This will permanently delete this item. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Icon icon={Icons.Plus} size="sm" className="mr-2" />
          Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>Create a new item in your collection.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter item title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="books">Books</option>
              <option value="clothing">Clothing</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Enter item description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const CustomClose: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Custom Close</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom Close Button</DialogTitle>
          <DialogDescription>
            This dialog has a custom close button in the footer instead of the default X button.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            The close button in the top-right corner is removed, and you can only close this dialog
            using the button below.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full">Got it, thanks!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const ScrollableContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Scrollable Content</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read through our terms and conditions carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold">1. Acceptance of Terms</h4>
            <p className="text-sm text-muted-foreground mt-2">
              By accessing and using this service, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">2. Privacy Policy</h4>
            <p className="text-sm text-muted-foreground mt-2">
              Your privacy is important to us. Please review our Privacy Policy, which also governs
              your use of the Service.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">3. User Responsibilities</h4>
            <p className="text-sm text-muted-foreground mt-2">
              You are responsible for maintaining the confidentiality of your account and password
              and for restricting access to your computer.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">4. Prohibited Uses</h4>
            <p className="text-sm text-muted-foreground mt-2">
              You may not use our service for any illegal or unauthorized purpose nor may you, in
              the use of the Service, violate any laws in your jurisdiction.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">5. Service Availability</h4>
            <p className="text-sm text-muted-foreground mt-2">
              We reserve the right to withdraw or amend this service, and any service or material we
              provide on the Service, in our sole discretion without notice.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">6. Limitation of Liability</h4>
            <p className="text-sm text-muted-foreground mt-2">
              In no event shall our company, nor its directors, employees, partners, agents,
              suppliers, or affiliates, be liable for any indirect, incidental, punitive,
              consequential or similar damages.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept Terms</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const AlertDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Icon icon={Icons.AlertTriangle} size="sm" className="mr-2" />
          Dangerous Action
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Icon icon={Icons.AlertTriangle} size="sm" />
            Warning: Destructive Action
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete all your data and cannot be undone. Please type
            "DELETE" below to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input placeholder='Type "DELETE" to confirm' />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" disabled>
            Confirm Deletion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const MultiStep: Story = {
  render: () => {
    const [step, setStep] = React.useState(1)
    const totalSteps = 3

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Multi-Step Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Setup Process - Step {step} of {totalSteps}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && "Let's start by setting up your basic information."}
              {step === 2 && "Now, let's configure your preferences."}
              {step === 3 && 'Finally, review and confirm your settings.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="notifications" className="rounded" />
                  <Label htmlFor="notifications">Enable email notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="updates" className="rounded" />
                  <Label htmlFor="updates">Receive product updates</Label>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Summary</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please review your information before completing the setup.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              {step < totalSteps ? (
                <Button onClick={() => setStep(step + 1)}>Next</Button>
              ) : (
                <DialogClose asChild>
                  <Button>Complete Setup</Button>
                </DialogClose>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
}
