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

export const Paragraphs: Story = {
  render: () => (
    <div className="space-y-12 max-w-2xl">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Paragraph Typography</h2>
        <p className="text-muted-foreground">
          Multiple paragraphs demonstrating body text styling, line height, and spacing. Use this to
          evaluate readability and visual rhythm.
        </p>
      </div>

      {/* Standard Body Text */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Standard Body Text</h3>
        <article className="space-y-4">
          <p>
            Typography is the art and technique of arranging type to make written language legible,
            readable, and appealing when displayed. The arrangement of type involves selecting
            typefaces, point sizes, line lengths, line-spacing, and letter-spacing, as well as
            adjusting the space between pairs of letters.
          </p>
          <p>
            Good typography establishes a strong visual hierarchy, provides a graphic balance to the
            website, and sets the product&apos;s overall tone. It should guide and inform users,
            optimize readability and accessibility, and ensure an excellent user experience.
          </p>
          <p>
            The goal is to create a seamless reading experience where the reader can focus on the
            content without being distracted by the formatting. Proper line height, letter spacing,
            and paragraph spacing all contribute to this goal.
          </p>
        </article>
      </section>

      {/* Long-form Content */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Long-form Content</h3>
        <article className="space-y-4">
          <p>
            In the realm of digital design, typography serves as the backbone of communication.
            Every choice—from font family to weight to size—carries meaning and influences how users
            perceive and interact with content. The subtle art lies in making these choices
            invisible, allowing the message to shine through without interference.
          </p>
          <p>
            Consider the rhythm of reading: the eye moves across lines, drops to the next, and
            continues its dance across the page. This rhythm must be comfortable, predictable, and
            effortless. Too tight, and words blur together; too loose, and the text becomes
            scattered and hard to follow.
          </p>
          <p>
            Modern web typography has evolved significantly with variable fonts, improved rendering
            engines, and better screen technologies. We now have more control than ever over how
            text appears across different devices and contexts. This power comes with
            responsibility—the responsibility to create accessible, beautiful, and functional text.
          </p>
          <p>
            The best typography is invisible. It doesn&apos;t call attention to itself but rather
            serves the content. When readers finish an article feeling informed and satisfied,
            without once thinking about the font or spacing, the typographer has succeeded.
          </p>
        </article>
      </section>

      {/* Mixed Content */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Mixed Content with Links</h3>
        <article className="space-y-4">
          <p>
            Typography extends beyond simple paragraphs. It encompasses{' '}
            <a href="#" className="underline underline-offset-4 hover:text-muted-foreground">
              inline links
            </a>{' '}
            that guide users to related content, <strong>bold text</strong> that emphasizes key
            points, and <em>italics</em> that add nuance and tone to the written word.
          </p>
          <p>
            The interplay between these elements creates texture in text. A wall of uniform
            paragraphs can feel monotonous, while strategic use of emphasis and variation keeps
            readers engaged. The key is balance—enough variety to maintain interest, but not so much
            that it becomes chaotic or distracting.
          </p>
          <p>
            Consider also the role of{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">inline code</code> in technical
            content, or the impact of properly styled quotations. Each element must harmonize with
            the others while serving its specific purpose.
          </p>
        </article>
      </section>

      {/* Size Variations */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Size Variations</h3>
        <div className="space-y-8">
          <div className="space-y-3">
            <span className="text-xs text-muted-foreground font-mono">text-xl</span>
            <p className="text-xl">
              Larger body text for lead paragraphs or introductions. This size commands attention
              while remaining comfortable to read in shorter passages.
            </p>
          </div>
          <div className="space-y-3">
            <span className="text-xs text-muted-foreground font-mono">text-base (default)</span>
            <p className="text-base">
              Standard body text optimized for extended reading. This is the workhorse of web
              typography, used for the majority of content.
            </p>
          </div>
          <div className="space-y-3">
            <span className="text-xs text-muted-foreground font-mono">text-sm</span>
            <p className="text-sm">
              Smaller text for captions, footnotes, or secondary information. Use sparingly as it
              can strain readability over long passages.
            </p>
          </div>
        </div>
      </section>

      {/* Article Layout with Headlines */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Article Layout with Headlines</h3>
        <article>
          <h1>The Art of Digital Typography: A Comprehensive Guide to Modern Web Standards</h1>
          <p>
            Typography is more than just choosing fonts—it&apos;s about creating a visual language
            that communicates meaning, establishes hierarchy, and guides readers through content
            with clarity and purpose.
          </p>

          <h2>Understanding Visual Hierarchy: Why Spacing and Weight Matter in Digital Content</h2>
          <p>
            Visual hierarchy is the arrangement of elements in order of importance. In typography,
            this is achieved through variations in size, weight, color, and spacing. A well-crafted
            hierarchy allows readers to scan content quickly and find what they need.
          </p>
          <p>
            Headlines serve as signposts, breaking up long passages and giving readers mental
            anchors. The spacing between a headline and the text that follows is crucial—it must be
            close enough to show relationship, yet distinct enough to create clear separation.
          </p>

          <h3>The Role of Heading Levels in Semantic Structure and Accessibility Best Practices</h3>
          <p>
            Each heading level serves a specific purpose. H1 typically appears once per page as the
            main title. H2 headings divide major sections, while H3 and H4 create subdivisions
            within those sections.
          </p>

          <h4>Spacing Considerations for Multi-line Headlines and Paragraph Transitions</h4>
          <p>
            The space above a heading should generally be larger than the space below it. This
            creates a clear visual break from the preceding content while maintaining connection to
            the content that follows.
          </p>
          <p>
            Consistent spacing ratios help establish rhythm. Many designers use a scale based on the
            base line height—for example, 1.5x above headings and 0.75x below.
          </p>

          <h5>Fine-Tuning Details and Subtle Typographic Adjustments for Enhanced Legibility</h5>
          <p>
            Smaller headings like H5 and H6 require careful attention. They must be distinct from
            body text while not overwhelming the content. This is often achieved through weight or
            subtle size differences rather than dramatic changes.
          </p>

          <h6>Micro-Typography and the Importance of Smallest Visual Elements and Spacing</h6>
          <p>
            Even the smallest typographic decisions matter. Letter spacing, word spacing, and the
            treatment of punctuation all contribute to the overall reading experience. These details
            may seem minor, but they accumulate to create either friction or flow.
          </p>

          <h2>Putting It All Together: Creating a Harmonious and Balanced Typographic System</h2>
          <p>
            A complete typography system considers all these elements holistically. Headlines and
            body text must work in harmony, with consistent spacing, complementary weights, and a
            coherent visual rhythm that guides readers effortlessly through content.
          </p>
          <p>
            The best typography systems are invisible—readers engage with the content without
            noticing the design decisions that make that engagement possible.
          </p>
        </article>
      </section>
    </div>
  ),
}
