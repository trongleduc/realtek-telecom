import Image from 'next/image'

import { resolveImage, type ImageSize } from '@/lib/media'

type Props = {
  media: unknown
  size?: ImageSize
  alt?: string
  className?: string
  /** Fill the positioned parent (object-fit: cover). */
  fill?: boolean
  sizes?: string
  priority?: boolean
}

export function Img({ media, size, alt, className, fill, sizes, priority }: Props) {
  const image = resolveImage(media, size, alt)
  if (!image) return null
  const altText = alt ?? image.alt
  const common = {
    src: image.url,
    className,
    sizes,
    priority,
    style: image.focal ? { objectPosition: image.focal } : undefined,
    unoptimized: image.mimeType === 'image/svg+xml',
  }
  if (fill) return <Image {...common} alt={altText} fill />
  return <Image {...common} alt={altText} width={image.width} height={image.height} />
}
