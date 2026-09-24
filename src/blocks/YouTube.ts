import type { Block } from 'payload'

export function youTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  return match?.[1] ?? null
}

export const YouTubeBlock: Block = {
  slug: 'youtube',
  interfaceName: 'YouTubeBlock',
  labels: { singular: 'Video YouTube', plural: 'Video YouTube' },
  fields: [
    {
      name: 'url',
      label: 'Link YouTube',
      type: 'text',
      required: true,
      validate: (value: unknown) =>
        typeof value === 'string' && youTubeId(value) ? true : 'Link YouTube không hợp lệ.',
    },
    { name: 'caption', label: 'Chú thích', type: 'text' },
  ],
}
