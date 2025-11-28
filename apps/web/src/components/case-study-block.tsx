/* eslint-disable @typescript-eslint/no-explicit-any */
import { SanityImage } from '@/components/sanity-image'
import { DecorativeVideoBlock } from '@/components/decorative-video-block'
import { MuxPlayer } from '@/components/mux-player'
import { CaseStudyCarousel } from '@/components/case-study-carousel'
import { PortableTextLite } from '@/components/portable-text-lite'

export function CaseStudyBlock({ block }: { block: any }) {
  if (block._type === 'imageBlock') {
    return (
      <section className="w-full space-y-3 py-2">
        <SanityImage image={block.image} className="w-full h-auto rounded-[8px]" />
        {block.image?.caption ? (
          <div className="mx-auto max-w-[592px] mt-2 text-center text-sm text-muted-foreground">
            {block.image.caption}
          </div>
        ) : null}
        {block.title ? (
          <div className="mx-auto max-w-[592px]">
            <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
          </div>
        ) : null}
        {block.description ? (
          <div className="mx-auto max-w-[592px]">
            <p className="text-muted-foreground">{block.description}</p>
          </div>
        ) : null}
      </section>
    )
  }

  if (block._type === 'videoBlock') {
    const playbackId: string | undefined = block.video?.asset?.playbackId
    if (!playbackId) return null

    if (block.mode === 'decorative') {
      return (
        <DecorativeVideoBlock
          playbackId={playbackId}
          title={block.title}
          description={block.description}
        />
      )
    }

    return (
      <section className="w-full space-y-3 py-2 max-w-[var(--content-max-width)] mx-auto">
        <MuxPlayer
          playbackId={playbackId}
          title={block.title}
          className="w-full h-auto rounded-[8px] overflow-hidden"
          autoPlay
          muted
          loop
        />
        {block.title ? (
          <div className="mx-auto max-w-[592px]">
            <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
          </div>
        ) : null}
        {block.description ? (
          <div className="mx-auto max-w-[592px]">
            <p className="text-muted-foreground">{block.description}</p>
          </div>
        ) : null}
      </section>
    )
  }

  if (block._type === 'carouselBlock') {
    const items: any[] = Array.isArray(block.items) ? block.items : []
    return <CaseStudyCarousel items={items} title={block.title} description={block.description} />
  }

  if (block._type === 'twoColumnImageBlock') {
    return (
      <section className="w-full py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SanityImage
              image={block.leftImage}
              className="w-full h-auto rounded-[8px]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {block.leftImage?.caption && (
              <div className="text-sm text-muted-foreground">{block.leftImage.caption}</div>
            )}
          </div>
          <div className="space-y-2">
            <SanityImage
              image={block.rightImage}
              className="w-full h-auto rounded-[8px]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {block.rightImage?.caption && (
              <div className="text-sm text-muted-foreground">{block.rightImage.caption}</div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (block._type === 'block') {
    return (
      <section className="mx-auto max-w-[592px] space-y-3 py-8">
        <PortableTextLite value={[block]} />
      </section>
    )
  }

  return null
}
