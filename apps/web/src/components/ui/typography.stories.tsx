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

export const Scale: Story = {
  render: () => (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fluid Typography Scale</h2>
        <p className="text-muted-foreground max-w-prose">
          Our typography system uses fluid scaling. Font sizes automatically adjust between a
          minimum size (at 375px viewport) and a maximum size (at 1440px viewport). This ensures
          optimal readability on all devices without abrupt breakpoints.
        </p>

        <div className="grid gap-8 mt-8">
          {[
            {
              class: 'text-6xl',
              usage: 'Hero Titles, Display Text',
              example: 'The quick brown fox',
            },
            { class: 'text-5xl', usage: 'Page Titles (h1)', example: 'The quick brown fox' },
            { class: 'text-4xl', usage: 'Section Headings (h2)', example: 'The quick brown fox' },
            {
              class: 'text-3xl',
              usage: 'Subsection Headings (h3)',
              example: 'The quick brown fox',
            },
            {
              class: 'text-2xl',
              usage: 'Card Titles, Feature Headings',
              example: 'The quick brown fox',
            },
            {
              class: 'text-xl',
              usage: 'Lead Paragraphs, Large Body',
              example: 'The quick brown fox',
            },
            { class: 'text-lg', usage: 'Default Body (Large)', example: 'The quick brown fox' },
            {
              class: 'text-base',
              usage: 'Default Body (Standard)',
              example: 'The quick brown fox',
            },
            {
              class: 'text-sm',
              usage: 'Metadata, Captions, UI Elements',
              example: 'The quick brown fox',
            },
            { class: 'text-xs', usage: 'Badges, Tiny Labels', example: 'The quick brown fox' },
          ].map((item) => (
            <div
              key={item.class}
              className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-baseline border-b pb-4 last:border-0"
            >
              <div className="space-y-1">
                <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                  {item.class}
                </code>
                <p className="text-xs text-muted-foreground">{item.usage}</p>
              </div>
              <div className={`${item.class} font-semibold text-foreground`}>{item.example}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

export const Headings: Story = {
  render: () => (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Standard Heading Hierarchy</p>
        <div className="border rounded-lg p-6 space-y-6">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Heading 1 (h1)
          </h1>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Heading 2 (h2)
          </h2>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Heading 3 (h3)</h3>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Heading 4 (h4)</h4>
        </div>
      </div>
    </div>
  ),
}

export const Paragraph: Story = {
  render: () => (
    <div className="space-y-4 max-w-3xl">
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        The king, seeing how much happier his subjects were, realized the error of his ways and
        repealed the joke tax. The people rejoiced and once again filled the kingdom with laughter
        and merriment.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        This is another paragraph to demonstrate the spacing between paragraphs. Notice how the
        margin-top is automatically applied to paragraphs that are not the first child.
      </p>
    </div>
  ),
}

export const Blockquote: Story = {
  render: () => (
    <blockquote className="mt-6 border-l-2 pl-6 italic max-w-3xl">
      &quot;After all,&quot; he said, &quot;everyone enjoys a good joke, so it&apos;s only fair that
      they should pay for the privilege.&quot;
    </blockquote>
  ),
}

export const List: Story = {
  render: () => (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="font-semibold mb-3">Unordered List</h3>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li>1st level of puns: 5 gold coins</li>
          <li>2nd level of jokes: 10 gold coins</li>
          <li>3rd level of one-liners: 20 gold coins</li>
          <li>
            Nested items:
            <ul className="ml-6 list-disc [&>li]:mt-1">
              <li>Wordplay: 2 gold coins</li>
              <li>Puns about puns: 3 gold coins</li>
            </ul>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Ordered List</h3>
        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
          <li>First, gather your materials</li>
          <li>Then, prepare the workspace</li>
          <li>Next, follow the instructions carefully</li>
          <li>Finally, test the result</li>
        </ol>
      </div>
    </div>
  ),
}

export const InlineCode: Story = {
  render: () => (
    <p className="leading-7 max-w-3xl">
      You can use the{' '}
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
        useState
      </code>{' '}
      hook to manage component state. Install packages with{' '}
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
        npm install
      </code>{' '}
      or{' '}
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
        pnpm add
      </code>
      .
    </p>
  ),
}

export const Table: Story = {
  render: () => (
    <div className="my-6 w-full overflow-y-auto max-w-3xl">
      <table className="w-full">
        <thead>
          <tr className="m-0 border-t p-0 even:bg-muted">
            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
              Repository
            </th>
            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
              Stars
            </th>
            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
              Forks
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="m-0 border-t p-0 even:bg-muted">
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              shadcn/ui
            </td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              87,000
            </td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              4,500
            </td>
          </tr>
          <tr className="m-0 border-t p-0 even:bg-muted">
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              vercel/next.js
            </td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              128,000
            </td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              28,000
            </td>
          </tr>
          <tr className="m-0 border-t p-0 even:bg-muted">
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              facebook/react
            </td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              230,000
            </td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              47,000
            </td>
          </tr>
        </tbody>
      </table>
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
        <div className="grid gap-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">100</span>
              Hairline
              <br />
              <span className="text-xs opacity-50">font-thin</span>
            </div>
            <div className="font-thin text-4xl">The quick brown fox</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">200</span>
              Thin
              <br />
              <span className="text-xs opacity-50">font-extralight</span>
            </div>
            <div className="font-extralight text-4xl">The quick brown fox</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">300</span>
              Light
              <br />
              <span className="text-xs opacity-50">font-light</span>
            </div>
            <div className="font-light text-4xl">The quick brown fox</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">400</span>
              Regular
              <br />
              <span className="text-xs opacity-50">font-normal</span>
            </div>
            <div className="font-normal text-4xl">The quick brown fox</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">500</span>
              Medium
              <br />
              <span className="text-xs opacity-50">font-medium</span>
            </div>
            <div className="font-medium text-4xl">The quick brown fox</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">600</span>
              Semibold
              <br />
              <span className="text-xs opacity-50">font-semibold</span>
            </div>
            <div className="font-semibold text-4xl">The quick brown fox</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">700</span>
              Bold
              <br />
              <span className="text-xs opacity-50">font-bold</span>
            </div>
            <div className="font-bold text-4xl">The quick brown fox</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">800</span>
              Extrabold
              <br />
              <span className="text-xs opacity-50">font-extrabold</span>
            </div>
            <div className="font-extrabold text-4xl">The quick brown fox</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b pb-4">
            <div className="w-40 shrink-0 text-sm text-muted-foreground">
              <span className="font-mono text-xs border rounded bg-muted px-1 mr-2">900</span>
              Black
              <br />
              <span className="text-xs opacity-50">font-black</span>
            </div>
            <div className="font-black text-4xl">The quick brown fox</div>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const TextColors: Story = {
  render: () => (
    <div className="space-y-2 max-w-3xl">
      <div className="text-foreground">Default foreground text</div>
      <div className="text-muted-foreground">Muted foreground text</div>
      <div className="text-primary">Primary color text</div>
      <div className="text-secondary-foreground">Secondary foreground text</div>
      <div className="text-destructive">Destructive color text</div>
      <div className="text-accent-foreground">Accent foreground text</div>
    </div>
  ),
}
