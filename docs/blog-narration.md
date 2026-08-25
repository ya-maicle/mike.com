# Blog narration workflow

Blog audio is generated ahead of publication with ElevenLabs, stored as a Sanity file
asset, and loaded by the article player only after a reader presses Play. Generation is
manual, while synthesis, upload, metadata, and draft attachment are automated.

## One-time local configuration

Add these values to `apps/web/.env.local` without committing them:

```bash
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
ELEVENLABS_VOICE_NAME=George
```

The default is ElevenLabs' British narration voice George with
`eleven_multilingual_v2`, selected for stable long-form delivery. The voice and model can
also be overridden per command.

The key should be restricted to Text to Speech and read-only Voices, with a usage cap and
automatic leak protection enabled. `ELEVENLABS_API_KEY` and `SANITY_API_WRITE_TOKEN`
must be server-only variables in each Vercel environment where the Studio action should
work. They are never added to the Studio bundle.

## Generate from Sanity Studio

1. Finish the title, excerpt, and article body. Optionally add a narration script override
   in **Article narration**.
2. Open the document actions menu beside **Publish** and choose **Generate narration**.
3. Wait for the confirmation that the MP3 is attached to the draft.
4. Review the audio and publish normally when ready.

Once an MP3 exists, the action becomes **Regenerate narration** and asks for confirmation
before using more ElevenLabs credits. Generation never publishes the document. If the
article changes while audio is being generated, the new audio is not attached and Studio
asks for another generation so audio cannot silently drift from the written draft.

The API authenticates the current Sanity Studio session and permits editor, developer,
administrator, or equivalent write access. Provider and write tokens stay on the server.

## Local fallback

Preview the derived script without spending ElevenLabs credits:

```bash
pnpm blog:narrate -- --slug designing-for-ai-agents --dry-run
```

Generate the MP3, upload it to Sanity, and attach its metadata to the post:

```bash
pnpm blog:narrate -- --slug designing-for-ai-agents
```

The command prefers a draft document when one exists, so publish the draft afterward.
If the article text and attached audio already share the same source hash, generation is
skipped. Use `--force` only when the same script needs a fresh performance.

For the production dataset, the safeguard requires an explicit flag:

```bash
pnpm blog:narrate -- --slug article-slug --allow-production
```

Useful overrides are `--voice-id`, `--voice-name`, and `--model`. Available account
voices can be inspected with `pnpm blog:narrate -- --list-voices` when the key has
read-only Voices access.

## Publishing behaviour

- The player appears only when Sanity contains a valid `audio/mpeg` asset and duration.
- The MP3 is not requested during page load; the browser receives its URL on the first
  Play interaction.
- Articles with narration disclose **AI narration** beside the publication date and
  expose an `AudioObject` in structured data.
- Reader controls include pause/play, 15-second skips, 0.5–2× speed, elapsed time, and
  canonical-link sharing.
- Published Sanity changes may take up to five minutes to appear through the current
  article cache.
