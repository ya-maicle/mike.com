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

export const AllTypography: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Taxing Laughter: The Joke Tax Chronicles
        </h1>
      </div>
      
      <div>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          The People of the Kingdom
        </h2>
      </div>
      
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          The Joke Tax
        </h3>
      </div>
      
      <div>
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          People stopped telling jokes
        </h4>
      </div>
      
      <div>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          The king, seeing how much happier his subjects were, realized the error of his ways and
          repealed the joke tax. The people rejoiced and once again filled the kingdom with
          laughter and merriment.
        </p>
      </div>
      
      <div>
        <blockquote className="mt-6 border-l-2 pl-6 italic">
          &quot;After all,&quot; he said, &quot;everyone enjoys a good joke, so it&apos;s only fair that they should
          pay for the privilege.&quot;
        </blockquote>
      </div>
      
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                King&apos;s Treasury
              </th>
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                People&apos;s happiness
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                Empty
              </td>
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                Overflowing
              </td>
            </tr>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                Modest
              </td>
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                Satisfied
              </td>
            </tr>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                Full
              </td>
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                Ecstatic
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li>1st level of puns: 5 gold coins</li>
          <li>2nd level of jokes: 10 gold coins</li>
          <li>3rd level of one-liners : 20 gold coins</li>
        </ul>
      </div>
      
      <div>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          You can write text with an{' '}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            inline code
          </code>{' '}
          snippet inside it.
        </p>
      </div>
      
      <div>
        <p className="text-xl text-muted-foreground">
          A modal dialog that interrupts the user with important content and expects a response.
        </p>
      </div>
      
      <div>
        <p className="text-lg font-semibold">
          Are you sure absolutely sure?
        </p>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">
          Enter your email address.
        </p>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">
          Built by <span className="font-medium text-foreground">shadcn</span>. The source code is
          available on{' '}
          <a href="#" className="font-medium text-primary underline underline-offset-4">
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  ),
}

export const Headings: Story = {
  render: () => (
    <div className="space-y-6">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Heading 1 (h1)
      </h1>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Heading 2 (h2)
      </h2>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Heading 3 (h3)
      </h3>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        Heading 4 (h4)
      </h4>
    </div>
  ),
}

export const Paragraph: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        The king, seeing how much happier his subjects were, realized the error of his ways and
        repealed the joke tax. The people rejoiced and once again filled the kingdom with
        laughter and merriment.
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
    <blockquote className="mt-6 border-l-2 pl-6 italic">
      &quot;After all,&quot; he said, &quot;everyone enjoys a good joke, so it&apos;s only fair that they should
      pay for the privilege.&quot;
    </blockquote>
  ),
}

export const Table: Story = {
  render: () => (
    <div className="my-6 w-full overflow-y-auto">
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

export const List: Story = {
  render: () => (
    <div className="space-y-6">
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
    <p className="leading-7">
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

export const Lead: Story = {
  render: () => (
    <p className="text-xl text-muted-foreground">
      A modal dialog that interrupts the user with important content and expects a response.
      This is typically used for confirmations, alerts, or important information.
    </p>
  ),
}

export const Large: Story = {
  render: () => (
    <div className="text-lg font-semibold">
      Are you absolutely sure you want to delete this item?
    </div>
  ),
}

export const Small: Story = {
  render: () => (
    <small className="text-sm font-medium leading-none">
      Email address
    </small>
  ),
}

export const Muted: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Enter your email address to continue.
      </p>
      <p className="text-sm text-muted-foreground">
        Built by{' '}
        <span className="font-medium text-foreground">shadcn</span>. The source code is
        available on{' '}
        <a href="#" className="font-medium text-primary underline underline-offset-4">
          GitHub
        </a>
        .
      </p>
    </div>
  ),
}

export const Links: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="leading-7">
        Visit our{' '}
        <a href="#" className="font-medium text-primary underline underline-offset-4">
          documentation
        </a>{' '}
        to learn more about the components.
      </p>
      <p className="leading-7">
        You can also check out the{' '}
        <a href="#" className="font-medium text-primary underline underline-offset-4 hover:no-underline">
          GitHub repository
        </a>{' '}
        for the source code.
      </p>
    </div>
  ),
}

export const TypographyScale: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-5xl font-extrabold">5xl - The quick brown fox</div>
        <div className="text-4xl font-bold">4xl - The quick brown fox</div>
        <div className="text-3xl font-bold">3xl - The quick brown fox</div>
        <div className="text-2xl font-semibold">2xl - The quick brown fox</div>
        <div className="text-xl font-semibold">xl - The quick brown fox</div>
        <div className="text-lg font-medium">lg - The quick brown fox</div>
        <div className="text-base">base - The quick brown fox</div>
        <div className="text-sm">sm - The quick brown fox</div>
        <div className="text-xs">xs - The quick brown fox</div>
      </div>
    </div>
  ),
}

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="font-thin">font-thin - The quick brown fox</div>
      <div className="font-extralight">font-extralight - The quick brown fox</div>
      <div className="font-light">font-light - The quick brown fox</div>
      <div className="font-normal">font-normal - The quick brown fox</div>
      <div className="font-medium">font-medium - The quick brown fox</div>
      <div className="font-semibold">font-semibold - The quick brown fox</div>
      <div className="font-bold">font-bold - The quick brown fox</div>
      <div className="font-extrabold">font-extrabold - The quick brown fox</div>
      <div className="font-black">font-black - The quick brown fox</div>
    </div>
  ),
}

export const TextColors: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="text-foreground">Default foreground text</div>
      <div className="text-muted-foreground">Muted foreground text</div>
      <div className="text-primary">Primary color text</div>
      <div className="text-secondary-foreground">Secondary foreground text</div>
      <div className="text-destructive">Destructive color text</div>
      <div className="text-accent-foreground">Accent foreground text</div>
    </div>
  ),
}