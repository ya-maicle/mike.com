import { defineField } from 'sanity'

export const narrationField = defineField({
  name: 'narration',
  title: 'AI narration',
  type: 'object',
  description:
    'Use Generate narration in the document actions menu when the content is ready, then review the attached MP3 before publishing.',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'scriptOverride',
      title: 'Narration script override',
      type: 'text',
      rows: 10,
      description:
        'Optional. Leave blank to narrate the title, summary, and text blocks from the content.',
    }),
    defineField({
      name: 'audioFile',
      title: 'MP3 file',
      type: 'file',
      options: { accept: 'audio/mpeg' },
    }),
    defineField({
      name: 'durationSeconds',
      title: 'Duration in seconds',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'model',
      title: 'Model',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'voiceId',
      title: 'Voice ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'voiceName',
      title: 'Voice name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'sourceHash',
      title: 'Source hash',
      type: 'string',
      readOnly: true,
      description: 'Used to detect when the source content has changed.',
    }),
    defineField({
      name: 'generatedAt',
      title: 'Generated at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'generationStatus',
      title: 'Generation status',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: 'Generating', value: 'generating' },
          { title: 'Ready', value: 'ready' },
          { title: 'Error', value: 'error' },
        ],
      },
    }),
    defineField({
      name: 'generationError',
      title: 'Last generation error',
      type: 'text',
      rows: 3,
      readOnly: true,
      hidden: ({ parent }) => parent?.generationStatus !== 'error',
    }),
  ],
})
