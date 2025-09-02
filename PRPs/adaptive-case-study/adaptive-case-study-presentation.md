name: "Adaptive Case Study Presentation Feature"
description: |

## Purpose

Implement a dynamic storytelling engine that transforms static case studies into adaptive narratives that automatically adjust content, depth, and focus based on visitor preferences and time constraints.

## Core Principles

1. **Context is King**: Leverage existing Sanity CMS and Next.js RSC architecture
2. **Validation Loops**: Build incrementally with testable components at each stage
3. **Information Dense**: Atomic content blocks with rich metadata for intelligent assembly
4. **Progressive Success**: Start with basic filtering, evolve to AI-powered narrative generation
5. **Global rules**: Follow all rules in CLAUDE.md and leverage existing design system

---

## Goal

Build an adaptive case study presentation system where a single case study can dynamically generate multiple narrative formats (30-second summary, 5-minute overview, 10-minute deep dive) tailored to different audiences (hiring managers, PMs, engineers) with appropriate focus areas (craft, leadership, systems, metrics).

## Why

- **Business value**: Increases portfolio engagement by serving relevant content to each visitor type
- **User experience**: Eliminates need to write and maintain multiple versions of same story
- **Professional impact**: Demonstrates systems thinking and product design skills through the feature itself
- **Content efficiency**: Single source of truth for all case study variants reduces maintenance overhead

## What

A system that stores case studies as atomic content blocks and dynamically assembles coherent narratives based on user preferences, ensuring every story maintains a clear problem → decision → outcome arc regardless of length or focus.

### Success Criteria

- [ ] Can generate 3 time variants (30s, 5min, 10min) from single case study
- [ ] Supports 4 focus areas (craft, leadership, systems, metrics) with appropriate block filtering
- [ ] Maintains narrative coherence through "spine block" enforcement
- [ ] Provides export capabilities (PDF, print, shareable links)
- [ ] Includes preset journeys for common personas
- [ ] Tracks analytics on popular story configurations

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- file: apps/web/src/sanity/client.ts
  why: Current Sanity integration patterns to extend

- file: packages/ui/src/components/*.tsx
  why: Design system components to leverage for story presentation

- file: apps/web/src/app/work/page.tsx
  why: Current work page structure to integrate with

- url: https://www.sanity.io/docs/schema-types
  section: Document schemas and references
  critical: Block-level content modeling patterns

- url: https://nextjs.org/docs/app/building-your-application/rendering/server-components
  why: Server-side assembly patterns for heavy computation

- docfile: CLAUDE.md
  why: Project conventions, monorepo structure, and coding standards
```

### Current Codebase tree

```bash
apps/web/src/
├── app/
│   ├── work/
│   │   └── page.tsx (existing work portfolio page)
│   ├── api/
│   │   └── health/route.ts (API route pattern)
│   └── layout.tsx
├── components/
│   ├── ui/ (design system components)
│   └── theme-provider.tsx
├── sanity/
│   └── client.ts (existing Sanity integration)
└── lib/
    └── utils.ts

packages/ui/src/
├── components/
│   ├── Button.tsx
│   └── (other design system components)
└── index.ts
```

### Desired Codebase tree with files to be added

```bash
apps/web/src/
├── app/
│   ├── work/
│   │   ├── [slug]/
│   │   │   ├── page.tsx (individual case study page)
│   │   │   └── actions.ts (story assembly server actions)
│   │   └── page.tsx (work listing page - existing)
│   ├── api/
│   │   └── case-studies/
│   │       └── [slug]/
│   │           └── assemble/route.ts (story assembly API)
├── components/
│   ├── adaptive-case-study/
│   │   ├── adaptive-case-study.tsx (main component)
│   │   ├── story-controls.tsx (time/focus controls)
│   │   ├── story-content.tsx (assembled narrative display)
│   │   ├── story-metadata.tsx (explanation and stats)
│   │   ├── export-options.tsx (PDF/print/share)
│   │   └── block-renderer.tsx (individual block display)
├── sanity/
│   ├── schemas/
│   │   ├── case-study.ts (main case study schema)
│   │   └── case-study-block.ts (atomic block schema)
│   └── queries/
│       └── case-study-queries.ts (GROQ queries)
└── lib/
    ├── adaptive-engine/
    │   ├── story-assembler.ts (core assembly logic)
    │   ├── narrative-optimizer.ts (ordering and coherence)
    │   ├── redaction-handler.ts (content privacy handling)
    │   └── ai-connector.ts (OpenAI integration for connective tissue)
    └── types/
        └── case-study.ts (TypeScript interfaces)
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Next.js App Router requires server actions for heavy computation
// Example: Story assembly must happen server-side due to complexity

// CRITICAL: Sanity requires proper reference handling
// Example: Block references need proper population in GROQ queries

// CRITICAL: Design system uses Tailwind with CSS variables
// Example: Dynamic styling must use existing token patterns

// CRITICAL: Current auth system is Supabase-based
// Example: User preferences must integrate with existing profile system

// CRITICAL: Export features require server-side PDF generation
// Example: Puppeteer integration for print-friendly layouts
```

## Implementation Blueprint

### Data models and structure

Create atomic content block system with rich metadata for intelligent assembly.

```typescript
// Core interfaces for type safety and consistency
interface CaseStudyBlock {
  id: string
  type:
    | 'context'
    | 'problem'
    | 'insight'
    | 'decision'
    | 'process'
    | 'outcome'
    | 'metric'
    | 'reflection'
    | 'artifact'
  priority: 1 | 2 | 3 // 1=essential, 2=important, 3=nice-to-have
  focusAreas: ('craft' | 'leadership' | 'systems' | 'metrics')[]
  timeWeight: number // reading time in seconds
  title: string
  content: PortableTextBlock[]
  artifacts?: Asset[]
  metrics?: {
    value: string
    source: string
    confidential: boolean
  }
  prerequisites: string[] // block IDs this depends on
  redactionLevel: 'public' | 'blur' | 'summary' | 'hidden'
}

interface StoryRequest {
  duration: number // target reading time in seconds
  focusAreas: string[]
  persona?: string
  includeArtifacts: boolean
}

interface AssembledStory {
  blocks: ProcessedBlock[]
  metadata: StoryMetadata
  explanation: string
}
```

### List of tasks to be completed in order

```yaml
Task 1 - Sanity Schema Setup:
  📋 DETAILED GUIDE: See stage-1-sanity-schema-setup.md for complete implementation

CREATE apps/web/src/sanity/schemas/case-study-block.ts:
  - MIRROR pattern from: existing Sanity schemas
  - IMPLEMENT atomic block structure with metadata
  - INCLUDE validation rules for required fields

CREATE apps/web/src/sanity/schemas/case-study.ts:
  - REFERENCE case-study-block documents
  - DEFINE spine blocks for narrative coherence
  - INCLUDE preset journey configurations

MODIFY apps/web/src/sanity/schemas/index.ts:
  - INJECT new schemas into schema array
  - PRESERVE existing schema registrations

Task 2 - TypeScript Interfaces:
CREATE apps/web/src/lib/types/case-study.ts:
  - DEFINE all core interfaces matching Sanity schemas
  - INCLUDE story request and assembly types
  - ENSURE type safety across components

Task 3 - Basic Assembly Engine:
CREATE apps/web/src/lib/adaptive-engine/story-assembler.ts:
  - IMPLEMENT core assembly logic class
  - INCLUDE time-based filtering algorithm
  - INCLUDE focus area filtering
  - INCLUDE spine block enforcement

CREATE apps/web/src/lib/adaptive-engine/narrative-optimizer.ts:
  - IMPLEMENT dependency resolution
  - IMPLEMENT narrative flow ordering
  - ENSURE coherent story structure

Task 4 - Sanity Queries:
CREATE apps/web/src/sanity/queries/case-study-queries.ts:
  - IMPLEMENT GROQ queries for case studies with populated blocks
  - INCLUDE filtering by published status
  - OPTIMIZE for performance with proper projections

Task 5 - Server Actions:
CREATE apps/web/src/app/work/[slug]/actions.ts:
  - IMPLEMENT assembleStory server action
  - INTEGRATE with story assembler classes
  - INCLUDE proper error handling and validation

Task 6 - API Routes:
CREATE apps/web/src/app/api/case-studies/[slug]/assemble/route.ts:
  - IMPLEMENT POST handler for story assembly
  - VALIDATE request parameters with Zod
  - RETURN assembled story JSON

Task 7 - Core Components:
CREATE apps/web/src/components/adaptive-case-study/story-controls.tsx:
  - IMPLEMENT time duration slider
  - IMPLEMENT focus area toggles
  - IMPLEMENT preset journey buttons
  - FOLLOW existing design system patterns

CREATE apps/web/src/components/adaptive-case-study/block-renderer.tsx:
  - IMPLEMENT different block type renderers
  - HANDLE artifact display conditionally
  - APPLY redaction levels appropriately

CREATE apps/web/src/components/adaptive-case-study/story-content.tsx:
  - IMPLEMENT assembled story display
  - INCLUDE loading states and transitions
  - HANDLE empty states gracefully

Task 8 - Main Component Integration:
CREATE apps/web/src/components/adaptive-case-study/adaptive-case-study.tsx:
  - INTEGRATE all sub-components
  - IMPLEMENT state management for story requests
  - HANDLE server action calls with loading states

CREATE apps/web/src/app/work/[slug]/page.tsx:
  - IMPLEMENT case study page with adaptive component
  - HANDLE initial story assembly on server
  - INCLUDE proper SEO and metadata

Task 9 - Export Features:
CREATE apps/web/src/components/adaptive-case-study/export-options.tsx:
  - IMPLEMENT PDF export functionality
  - IMPLEMENT shareable link generation
  - IMPLEMENT print-friendly styling

Task 10 - AI Integration (Optional Enhancement):
CREATE apps/web/src/lib/adaptive-engine/ai-connector.ts:
  - IMPLEMENT OpenAI integration for connective tissue
  - INCLUDE prompt engineering for narrative coherence
  - HANDLE API errors gracefully
```

### Per task pseudocode for critical tasks

```typescript
// Task 3 - Story Assembler Core Logic
class AdaptiveStoryEngine {
  async assembleStory(caseStudy: CaseStudy, request: StoryRequest): Promise<AssembledStory> {
    // PATTERN: Load with proper Sanity reference resolution
    const blocks = await this.loadBlocksWithDependencies(caseStudy.blocks)

    // CRITICAL: Always include spine blocks for coherence
    const spineBlocks = blocks.filter((b) => caseStudy.spineBlocks.includes(b.id))

    // ALGORITHM: Score blocks by relevance to request
    const scoredBlocks = blocks.map((block) => ({
      ...block,
      relevanceScore: this.calculateRelevance(block, request),
    }))

    // CONSTRAINT: Respect time budget while maximizing value
    const selectedBlocks = this.selectOptimalBlocks(scoredBlocks, request.duration)

    // GUARANTEE: Always include spine blocks even if over budget
    const finalBlocks = this.ensureSpineBlocks([...selectedBlocks, ...spineBlocks])

    // PATTERN: Order for narrative flow (problem -> solution -> outcome)
    const orderedBlocks = this.orderForNarrative(finalBlocks)

    return {
      blocks: orderedBlocks,
      metadata: this.generateMetadata(request, orderedBlocks),
      explanation: this.explainSelection(orderedBlocks, request),
    }
  }
}
```

### Integration Points

```yaml
SANITY_STUDIO:
  - schemas: Add case-study and case-study-block to studio
  - preview: Custom preview components for block visualization

EXISTING_WORK_PAGE:
  - modify: apps/web/src/app/work/page.tsx
  - pattern: Add links to individual adaptive case studies

DESIGN_SYSTEM:
  - extend: Use existing Button, Card, Badge components
  - pattern: Follow established Tailwind token usage

SUPABASE_INTEGRATION:
  - tables: Add user_story_preferences for saved configurations
  - rls: Protect user preferences with existing auth patterns

ANALYTICS:
  - events: Track story configurations and export actions
  - pattern: Use existing PostHog integration patterns
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint                           # ESLint + Prettier
pnpm typecheck                      # TypeScript checking
pnpm --filter @maicle/ui build      # Design system compilation

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests

```typescript
// CREATE apps/web/src/lib/adaptive-engine/__tests__/story-assembler.test.ts
describe('AdaptiveStoryEngine', () => {
  test('assembles story within time budget', async () => {
    const engine = new AdaptiveStoryEngine()
    const story = await engine.assembleStory(mockCaseStudy, {
      duration: 60, // 1 minute
      focusAreas: ['craft'],
      includeArtifacts: false,
    })

    const totalTime = story.blocks.reduce((acc, block) => acc + block.timeWeight, 0)
    expect(totalTime).toBeLessThanOrEqual(60)
  })

  test('always includes spine blocks', async () => {
    const engine = new AdaptiveStoryEngine()
    const story = await engine.assembleStory(mockCaseStudy, {
      duration: 30, // very short
      focusAreas: ['craft'],
      includeArtifacts: false,
    })

    const spineBlockIds = mockCaseStudy.spineBlocks
    const includedIds = story.blocks.map((b) => b.id)

    spineBlockIds.forEach((id) => {
      expect(includedIds).toContain(id)
    })
  })
})
```

```bash
# Run and iterate until passing:
pnpm test
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test

```bash
# Start development server
pnpm dev

# Test case study page loads
curl -I http://localhost:3000/work/example-case-study
# Expected: 200 OK with proper content-type

# Test story assembly API
curl -X POST http://localhost:3000/api/case-studies/example/assemble \
  -H "Content-Type: application/json" \
  -d '{"duration": 120, "focusAreas": ["craft", "systems"], "includeArtifacts": true}'

# Expected: JSON response with assembled story structure
```

## Final validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`
- [ ] Storybook builds: `pnpm --filter @maicle/ui build-storybook`
- [ ] Manual test: Case study page loads and adapts content
- [ ] Export functionality works: PDF generation succeeds
- [ ] Analytics events fire: PostHog receives story configuration events
- [ ] Accessibility verified: Components pass a11y tests in Storybook

---

## Anti-Patterns to Avoid

- ❌ Don't create new design patterns when existing design system works
- ❌ Don't skip Sanity schema validation - use proper field types and validation
- ❌ Don't ignore time budget constraints - always respect user preferences
- ❌ Don't break narrative coherence for brevity - spine blocks are sacred
- ❌ Don't hardcode story configurations - make everything data-driven
- ❌ Don't expose sensitive content - respect redaction levels strictly
- ❌ Don't ignore loading states - story assembly takes time
- ❌ Don't skip mobile responsiveness - portfolio viewers use phones
