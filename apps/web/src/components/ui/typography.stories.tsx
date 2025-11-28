import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// Typography in shadcn/ui is implemented as utility classes, not components
// So we'll create a dummy component just for Storybook organization
const Typography = () => null

const meta: Meta<typeof Typography> = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Typography System</h2>
        <p className="text-muted-foreground max-w-prose">
          Our typography system uses fluid scaling and specific font weights to ensure optimal
          readability across all devices. Use these utility classes to apply the design
          system&apos;s typography styles.
        </p>

        <div className="border rounded-lg overflow-hidden mt-8">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3">Token / Usage</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Specs</th>
                <th className="px-4 py-3 w-1/2">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                {
                  token: 'Hero',
                  class: 'text-6xl',
                  specs: 'Medium (500), -0.03em',
                  styles: 'font-medium tracking-[-0.03em]',
                  example: 'The quick brown fox',
                },
                {
                  token: 'H2',
                  class: 'text-5xl',
                  specs: 'Medium (500), -0.02em',
                  styles: 'font-medium tracking-[-0.02em]',
                  example: 'The quick brown fox',
                },
                {
                  token: 'H3',
                  class: 'text-4xl',
                  specs: 'Medium (500), -0.02em',
                  styles: 'font-medium tracking-[-0.02em]',
                  example: 'The quick brown fox',
                },
                {
                  token: 'H4',
                  class: 'text-3xl',
                  specs: 'Medium (500), -0.02em',
                  styles: 'font-medium tracking-[-0.02em]',
                  example: 'The quick brown fox',
                },
                {
                  token: 'H5',
                  class: 'text-2xl',
                  specs: 'Medium (500), -0.02em',
                  styles: 'font-medium tracking-[-0.02em]',
                  example: 'The quick brown fox',
                },
                {
                  token: 'P1',
                  class: 'text-xl',
                  specs: 'Normal (400)',
                  styles: 'font-normal',
                  example: 'The quick brown fox jumps over the lazy dog.',
                },
                {
                  token: 'H6',
                  class: 'text-lg',
                  specs: 'Medium (500), -0.02em',
                  styles: 'font-medium tracking-[-0.02em]',
                  example: 'The quick brown fox',
                },
                {
                  token: 'P2',
                  class: 'text-base',
                  specs: 'Normal (400)',
                  styles: 'font-normal',
                  example: 'The quick brown fox jumps over the lazy dog.',
                },
                {
                  token: 'Small',
                  class: 'text-sm',
                  specs: 'Normal (400)',
                  styles: 'font-normal',
                  example: 'The quick brown fox jumps over the lazy dog.',
                },
                {
                  token: 'Button',
                  class: 'text-base',
                  specs: 'Normal (400)',
                  styles: 'font-normal',
                  example: 'Button Text',
                },
              ].map((item) => (
                <tr key={item.token} className="bg-card">
                  <td className="px-4 py-4 font-medium">{item.token}</td>
                  <td className="px-4 py-4">
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                      {item.class}
                    </code>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-xs">{item.specs}</td>
                  <td className="px-4 py-4">
                    <div className={`${item.class} ${item.styles} text-foreground truncate`}>
                      {item.example}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}

export const DefaultStyles: Story = {
  render: () => (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Default HTML Elements</h2>
        <p className="text-muted-foreground">
          These elements rely purely on global CSS styles from <code>globals.css</code> without any
          utility classes. This ensures that markdown content or unstyled HTML renders correctly.
        </p>

        <div className="border rounded-lg p-8 space-y-8 mt-4">
          <div className="space-y-6">
            <div className="grid grid-cols-[100px_1fr] items-baseline gap-4">
              <span className="text-xs text-muted-foreground font-mono">&lt;h1&gt;</span>
              <h1>Heading 1</h1>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-baseline gap-4">
              <span className="text-xs text-muted-foreground font-mono">&lt;h2&gt;</span>
              <h2>Heading 2</h2>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-baseline gap-4">
              <span className="text-xs text-muted-foreground font-mono">&lt;h3&gt;</span>
              <h3>Heading 3</h3>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-baseline gap-4">
              <span className="text-xs text-muted-foreground font-mono">&lt;h4&gt;</span>
              <h4>Heading 4</h4>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-baseline gap-4">
              <span className="text-xs text-muted-foreground font-mono">&lt;h5&gt;</span>
              <h5>Heading 5</h5>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-baseline gap-4">
              <span className="text-xs text-muted-foreground font-mono">&lt;h6&gt;</span>
              <h6>Heading 6</h6>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-baseline gap-4">
              <span className="text-xs text-muted-foreground font-mono">&lt;p&gt;</span>
              <p>
                The quick brown fox jumps over the lazy dog. This paragraph demonstrates the default
                body text style, including line height and font weight. It flows naturally and is
                legible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Font Weights</h2>
        <p className="text-muted-foreground">
          The Plain font family includes weights from 100 to 900.
        </p>
        <div className="grid gap-6 mt-8">
          {[
            { weight: '100', label: 'Hairline', class: 'font-thin' },
            { weight: '200', label: 'Thin', class: 'font-extralight' },
            { weight: '300', label: 'Light', class: 'font-light' },
            { weight: '400', label: 'Regular', class: 'font-normal' },
            { weight: '500', label: 'Medium', class: 'font-medium' },
            { weight: '600', label: 'Semibold', class: 'font-semibold' },
            { weight: '700', label: 'Bold', class: 'font-bold' },
            { weight: '800', label: 'Extrabold', class: 'font-extrabold' },
            { weight: '900', label: 'Black', class: 'font-black' },
          ].map((item) => (
            <div
              key={item.weight}
              className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4"
            >
              <div className="w-40 shrink-0 text-sm text-muted-foreground">
                <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">
                  {item.weight}
                </span>
                {item.label}
                <br />
                <span className="text-xs opacity-50">{item.class}</span>
              </div>
              <div className={`${item.class} text-4xl`}>The quick brown fox</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}
