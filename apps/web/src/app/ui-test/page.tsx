import { Button } from '@maicle/ui'

export default function UITestPage() {
  const variants = ['default', 'secondary', 'outline', 'ghost', 'destructive'] as const
  const sizes = ['sm', 'md', 'lg'] as const
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">UI Component Test Page</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Button Sizes</h2>
        <div className="flex items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">✓</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button leftIcon="←">With Left Icon</Button>
          <Button rightIcon="→">With Right Icon</Button>
          <Button leftIcon="←" rightIcon="→">
            Both Icons
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Variant × Size Matrix</h2>
        <div className="grid grid-cols-4 gap-4">
          {variants.map((variant) =>
            sizes.map((size) => (
              <Button key={`${variant}-${size}`} variant={variant} size={size}>
                {variant} {size}
              </Button>
            )),
          )}
        </div>
      </section>
    </div>
  )
}
