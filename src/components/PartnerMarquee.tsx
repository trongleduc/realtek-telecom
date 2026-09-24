import Image from 'next/image'

import type { Partner } from '@/payload-types'
import { resolveImage } from '@/lib/media'

export function PartnerMarquee({ partners }: { partners: Partner[] }) {
  const items = partners
    .map((p) => ({ id: p.id, name: p.name, url: p.url, logo: resolveImage(p.logo, undefined, p.name) }))
    .filter((p) => p.logo)
  if (!items.length) return null
  // Repeat until one copy is wide enough, then render it twice for a seamless -50% loop.
  const copy = Array.from({ length: Math.max(1, Math.ceil(10 / items.length)) }, () => items).flat()

  return (
    <div className="marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul
        className="marquee-track flex w-max items-center"
        style={{ ['--marquee-duration' as string]: `${copy.length * 4}s` }}
      >
        {[0, 1].map((round) =>
          copy.map((p, i) => (
            <li key={`${round}-${i}-${p.id}`} className="px-8 md:px-12" aria-hidden={round === 1 || i >= items.length}>
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={round === 1 || i >= items.length ? -1 : undefined}
                  className="block opacity-60 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
                >
                  <Image
                    src={p.logo!.url}
                    alt={p.name}
                    width={p.logo!.width}
                    height={p.logo!.height}
                    unoptimized={p.logo!.mimeType === 'image/svg+xml'}
                    className="h-10 w-auto max-w-[150px] object-contain md:h-12"
                  />
                </a>
              ) : (
                <Image
                  src={p.logo!.url}
                  alt={p.name}
                  width={p.logo!.width}
                  height={p.logo!.height}
                  unoptimized={p.logo!.mimeType === 'image/svg+xml'}
                  className="h-10 w-auto max-w-[150px] object-contain opacity-60 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0 md:h-12"
                />
              )}
            </li>
          )),
        )}
      </ul>
    </div>
  )
}
