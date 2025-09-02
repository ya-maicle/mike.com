name: "Stage 1: Sanity Schema Setup for Adaptive Case Studies"
description: |

## Purpose

Implement atomic content modeling in Sanity CMS with proper validation, references, and Studio customization to support the adaptive case study presentation feature.

## Core Principles

1. **Context is King**: Leverage existing Sanity patterns while extending for atomic content blocks
2. **Validation Loops**: Build schemas with proper validation and test each component
3. **Information Dense**: Rich metadata on content blocks enables intelligent story assembly
4. **Progressive Success**: Start with basic schemas, validate in Studio, then enhance
5. **Global rules**: Follow all rules in CLAUDE.md and Sanity best practices

---

## Goal

Create a robust content modeling foundation in Sanity that supports atomic content blocks with rich metadata, allowing for dynamic assembly of case study narratives based on user preferences and time constraints.

## Why

- **Foundation**: Atomic content blocks are the core requirement for adaptive storytelling
- **Maintainability**: Single source of truth eliminates content duplication across variants
- **Flexibility**: Rich metadata enables intelligent filtering and assembly algorithms
- **Studio UX**: Proper schemas with validation make content creation intuitive for editors

## What

Two primary Sanity document types: `caseStudyBlock` (atomic content units) and `caseStudy` (collections with assembly rules), plus Studio configuration for optimal content creation workflow.

### Success Criteria

- [ ] `caseStudyBlock` schema supports all block types with proper validation
- [ ] `caseStudy` schema handles references and preset journeys correctly
- [ ] Sanity Studio interface is intuitive for content creation
- [ ] Schemas validate properly with no TypeScript errors
- [ ] Reference relationships work correctly in Studio
- [ ] Content can be created, edited, and published successfully

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: apps/web/src/sanity/client.ts
  why: Current Sanity client configuration and patterns

- url: https://www.sanity.io/docs/schema-types
  section: Document schemas, field types, and validation
  critical: defineType and defineField helper functions for TypeScript support

- url: https://www.sanity.io/docs/structure-builder
  section: Studio customization and structure
  critical: Custom preview components and document organization

- file: docs/product_requirements_document.md
  why: Understanding existing tech stack and development conventions

- docfile: CLAUDE.md
  why: Project conventions, monorepo structure, and coding standards

- url: https://www.sanity.io/docs/portable-text
  section: Rich text field configuration
  critical: Block content modeling for flexible rendering
```

### Current Codebase tree

```bash
apps/web/src/
├── sanity/
│   ├── client.ts (existing Sanity client setup)
│   └── test-connection.ts (connection testing utility)
└── (no existing schemas or Studio config)

# Missing Studio configuration files:
# - sanity.config.ts (in project root)
# - schema files in apps/web/src/sanity/schemas/
```

### Desired Codebase tree with files to be added

```bash
# Project root
sanity.config.ts (Studio configuration with custom structure)

# Sanity schemas
apps/web/src/sanity/schemas/
├── index.ts (schema registry)
├── case-study-block.ts (atomic content blocks)
└── case-study.ts (case study collections)

# Supporting files
package.json (updated with Sanity Studio scripts)
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Sanity requires proper environment variables
// Example: NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET must be set

// CRITICAL: Use defineType and defineField for TypeScript support
// Example: Better IDE suggestions and type safety in schema definitions

// CRITICAL: Reference fields need proper filtering to prevent circular dependencies
// Example: Block prerequisites should not reference themselves

// CRITICAL: Validation rules must account for empty/optional states
// Example: Arrays should validate both empty and populated states

// CRITICAL: Preview functions need null checks for incomplete documents
// Example: Handle missing fields gracefully in Studio preview
```

## Implementation Blueprint

### Data models and structure

Create atomic content modeling with rich metadata for intelligent assembly.

```typescript
// Core schema interfaces matching Sanity document structure
interface CaseStudyBlockSchema {
  name: 'caseStudyBlock';
  type: 'document';
  fields: [
    { name: 'id', type: 'slug', validation: required },
    { name: 'type', type: 'string', options: { list: blockTypes } },
    { name: 'priority', type: 'number', validation: range(1,3) },
    { name: 'focusAreas', type: 'array', of: [{ type: 'string' }] },
    { name: 'timeWeight', type: 'number', validation: range(5,300) },
    { name: 'content', type: 'array', of: [blocks, images] },
    // ... additional metadata fields
  ];
}

interface CaseStudySchema {
  name: 'caseStudy';
  type: 'document';
  fields: [
    { name: 'title', type: 'string', validation: required },
    { name: 'blocks', type: 'array', of: [references] },
    { name: 'spineBlocks', type: 'array', of: [references] },
    { name: 'presetJourneys', type: 'array', of: [objects] },
    // ... additional configuration fields
  ];
}
```

### List of tasks to be completed in order

```yaml
Task 1 - Install Sanity Dependencies:
RUN pnpm add sanity @sanity/vision lucide-react:
  - INSTALL core Sanity packages for Studio and icons
  - VERIFY installation with pnpm list command
  - ENSURE compatibility with existing Next.js setup

Task 2 - Create Schema Structure:
CREATE apps/web/src/sanity/schemas/index.ts:
  - EXPORT schema registry array
  - IMPORT and register new document types
  - FOLLOW existing import patterns in codebase

CREATE apps/web/src/sanity/schemas/case-study-block.ts:
  - IMPLEMENT atomic block schema with defineType helper
  - INCLUDE all block type options with proper validation
  - ADD custom preview function for Studio interface
  - INCLUDE proper field descriptions for content editors

CREATE apps/web/src/sanity/schemas/case-study.ts:
  - IMPLEMENT main case study schema with references
  - INCLUDE preset journey object configurations
  - ADD validation for spine block requirements
  - IMPLEMENT custom preview with status indicators

Task 3 - Studio Configuration:
CREATE sanity.config.ts (project root):
  - IMPORT schemas from apps/web/src/sanity/schemas
  - CONFIGURE deskTool with custom structure
  - ADD visionTool for GROQ query testing
  - SET environment variables for project/dataset

Task 4 - Package Scripts:
MODIFY package.json:
  - ADD sanity:dev script for Studio development
  - ADD sanity:build script for production builds
  - ADD sanity:deploy script for Studio deployment
  - PRESERVE existing script configurations

Task 5 - Schema Validation Testing:
START Studio with pnpm sanity:dev:
  - VERIFY schemas load without TypeScript errors
  - TEST field validation rules work correctly
  - CONFIRM reference relationships display properly
  - VALIDATE custom preview functions render correctly

Task 6 - Content Creation Testing:
CREATE test case study in Studio:
  - ADD content blocks with different types and priorities
  - TEST reference selection for spine blocks
  - VERIFY preset journey configuration works
  - CONFIRM published/draft status handling

Task 7 - GROQ Query Preparation:
TEST basic queries in Vision tool:
  - QUERY all case studies with block references
  - TEST filtering by published status
  - VERIFY reference population works correctly
  - DOCUMENT query patterns for future API implementation
```

### Per task pseudocode for critical tasks

```typescript
// Task 2 - Case Study Block Schema Implementation
export const caseStudyBlock = defineType({
  name: 'caseStudyBlock',
  title: 'Case Study Block',
  type: 'document',

  fields: [
    defineField({
      name: 'type',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: 'Context', value: 'context' },
          { title: 'Problem', value: 'problem' },
          // ... all block types with proper titles
        ],
      },
    }),

    defineField({
      name: 'focusAreas',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(1),
      options: {
        list: ['craft', 'leadership', 'systems', 'metrics'],
      },
    }),

    // PATTERN: Rich content with proper validation
    defineField({
      name: 'content',
      type: 'array',
      validation: (Rule) => Rule.required(),
      of: [
        {
          type: 'block',
          styles: [
            /* defined styles */
          ],
          marks: {
            /* defined marks */
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', validation: (Rule) => Rule.required() }],
        },
      ],
    }),
  ],

  // CRITICAL: Custom preview for Studio usability
  preview: {
    select: { title: 'title', type: 'type', priority: 'priority' },
    prepare(selection) {
      const priorityIcon = selection.priority === 1 ? '🔴' : '🟡'
      return {
        title: `${priorityIcon} ${selection.title}`,
        subtitle: selection.type,
      }
    },
  },
})
```

### Integration Points

```yaml
ENVIRONMENT_VARIABLES:
  - verify: NEXT_PUBLIC_SANITY_PROJECT_ID exists
  - verify: NEXT_PUBLIC_SANITY_DATASET exists
  - add: SANITY_API_READ_TOKEN for server operations

EXISTING_CLIENT:
  - preserve: apps/web/src/sanity/client.ts configuration
  - extend: Import schemas for type checking when needed

DEVELOPMENT_WORKFLOW:
  - script: pnpm sanity:dev starts Studio on localhost:3333
  - script: pnpm dev continues to run Next.js on localhost:3000
  - integration: Both can run simultaneously for development
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                      # TypeScript checking for schemas
cd apps/web && pnpm lint           # ESLint for schema files
pnpm sanity:build                  # Test Studio build process

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Schema Validation Testing

```typescript
// Manual testing in Sanity Studio after pnpm sanity:dev
// CREATE test documents to verify:

// Test Case Study Block Creation:
// 1. All field types accept valid input
// 2. Validation rules prevent invalid data
// 3. Preview functions display correctly
// 4. Reference selection works for prerequisites

// Test Case Study Creation:
// 1. Block references populate correctly
// 2. Spine block filtering works (priority === 1)
// 3. Preset journey objects validate properly
// 4. Published status toggles correctly

// Test Reference Relationships:
// 1. Case study -> blocks relationship displays in Studio
// 2. Block -> prerequisite blocks prevents circular references
// 3. Spine blocks filter shows only priority 1 blocks
// 4. All references resolve correctly in document views
```

```bash
# Manual validation steps:
# 1. Start Studio: pnpm sanity:dev
# 2. Navigate to http://localhost:3333
# 3. Create test documents and verify all fields work
# 4. Test reference selection and validation
# 5. Confirm preview functions display correctly
```

### Level 3: GROQ Query Testing

```bash
# Test basic queries in Vision tool (Studio -> Vision tab)
# Query 1: Get all case studies
*[_type == "caseStudy"]

# Query 2: Get case study with populated blocks
*[_type == "caseStudy" && slug.current == "test-case-study"][0]{
  ...,
  blocks[]->{
    _id,
    title,
    type,
    priority,
    focusAreas,
    timeWeight
  }
}

# Query 3: Get blocks by type
*[_type == "caseStudyBlock" && type == "context"]

# Expected: All queries return properly structured data
```

## Final validation Checklist

- [ ] Schemas load without TypeScript errors: `pnpm typecheck`
- [ ] Studio builds successfully: `pnpm sanity:build`
- [ ] Studio runs locally: `pnpm sanity:dev` opens at localhost:3333
- [ ] Can create case study block documents with all field types
- [ ] Can create case study documents with block references
- [ ] Reference relationships work correctly (no circular dependencies)
- [ ] Validation rules prevent invalid data entry
- [ ] Preview functions display helpful information
- [ ] GROQ queries return expected data structure in Vision tool

---

## Anti-Patterns to Avoid

- ❌ Don't skip field validation - every input should have appropriate rules
- ❌ Don't create circular reference possibilities - use proper filtering
- ❌ Don't ignore preview functions - they significantly improve editor experience
- ❌ Don't hardcode options - use proper list configurations for consistency
- ❌ Don't skip TypeScript helpers - use defineType and defineField
- ❌ Don't forget null checks in preview functions - handle incomplete documents
- ❌ Don't overcomplicate initial schema - start simple and iterate based on usage
