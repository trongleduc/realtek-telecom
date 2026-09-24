import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import type { DefaultNodeTypes, SerializedBlockNode, SerializedLinkNode } from '@payloadcms/richtext-lexical'

import { youTubeId } from '@/blocks/YouTube'
import type { YouTubeBlock } from '@/payload-types'

const collectionPaths: Record<string, string> = {
  services: '/services',
  projects: '/projects',
  posts: '/news',
  documents: '/documents',
}

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { relationTo, value } = linkNode.fields.doc ?? {}
  if (!relationTo || typeof value !== 'object' || !value) return '/'
  const base = collectionPaths[relationTo]
  const slug = (value as { slug?: string }).slug
  return base && slug ? `${base}/${slug}` : '/'
}

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<YouTubeBlock>

const converters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    youtube: ({ node }) => {
      const id = youTubeId(node.fields.url)
      if (!id) return null
      return (
        <figure className="my-8">
          <div className="relative aspect-video overflow-hidden bg-ink">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title={node.fields.caption || 'YouTube'}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {node.fields.caption ? (
            <figcaption className="mt-2 text-center text-sm text-ink-soft">{node.fields.caption}</figcaption>
          ) : null}
        </figure>
      )
    },
  },
})

export function RichText({ data, className = '' }: { data?: SerializedEditorState | null; className?: string }) {
  if (!data) return null
  return (
    <LexicalRichText data={data} converters={converters} className={`prose-rt ${className}`} disableContainer={false} />
  )
}
