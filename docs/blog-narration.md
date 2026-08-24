# Blog narration workflow

Blog audio is generated ahead of publication with ElevenLabs, stored as a Sanity file
asset, and loaded by the article player only after a reader presses Play. The API key is
used by the local generation command only; it is not needed by the website at runtime.

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
automatic leak protection enabled. Existing Sanity read/write variables are also
required.

## Generate or refresh an article

1. Finish the title, excerpt, and article body in Sanity. Optionally add a narration
   script override in the article's **Article narration** section.
2. Preview the derived script without spending ElevenLabs credits:

   ```bash
   pnpm blog:narrate -- --slug designing-for-ai-agents --dry-run
   ```

3. Generate the MP3, upload it to Sanity, and attach its metadata to the post:

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
