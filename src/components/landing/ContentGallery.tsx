import Section from './system/Section';
import SectionHeading from './system/SectionHeading';
import type { GalleryItems } from './types';

interface Props { items: GalleryItems; }

const allowMap: Record<string, string> = {
  youtube: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  vimeo: 'autoplay; fullscreen; picture-in-picture',
  loom: 'autoplay; fullscreen',
  figma: 'fullscreen',
  other: 'fullscreen',
};

export default function ContentGallery({ items }: Props) {
  return (
    <Section id="gallery" ariaLabel="Product gallery">
      <SectionHeading eyebrow="See it in action">Content Gallery</SectionHeading>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((m) => {
          if (m.kind === 'image') {
            return (
              <img
                key={m.id}
                src={m.src}
                alt={m.alt ?? ''}
                width={m.width}
                height={m.height}
                className="w-full h-auto rounded-xl border border-[var(--border-muted)]"
              />
            );
          }
          if (m.kind === 'video') {
            return (
              <video key={m.id} className="w-full rounded-xl border border-[var(--border-muted)]" controls preload="metadata" poster={m.title}>
                <source src={m.src} />
                Your browser does not support the video tag.
              </video>
            );
          }
          const provider = m.provider ?? 'other';
          return (
            <div key={m.id} className="aspect-video w-full overflow-hidden rounded-xl border border-[var(--border-muted)]">
              <iframe
                src={m.src}
                title={m.title ?? 'Embedded content'}
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                allow={allowMap[provider]}
                className="w-full h-full"
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
