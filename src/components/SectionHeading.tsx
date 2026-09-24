import type { ReactNode } from 'react'

import { ArrowRight } from './Icons'
import { Reveal } from './reveal/Reveal'
import { SmartLink } from './SmartLink'

type Props = {
  eyebrow?: string | null
  title: string
  action?: { label: string; href: string }
  children?: ReactNode
  className?: string
  as?: 'h1' | 'h2'
}

export function SectionHeading({ eyebrow, title, action, children, className = '', as: Tag = 'h2' }: Props) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <Reveal variant="mask-x">
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
        ) : null}
        <Reveal variant="up" delay={100}>
          <Tag className="section-title mt-4">{title}</Tag>
        </Reveal>
        {children ? (
          <Reveal variant="up" delay={200}>
            <div className="mt-5 max-w-2xl text-[17px] text-ink-soft">{children}</div>
          </Reveal>
        ) : null}
      </div>
      {action ? (
        <Reveal variant="left" delay={250} className="shrink-0">
          <SmartLink href={action.href} className="link-arrow text-brand">
            <span className="underline-grow">{action.label}</span> <ArrowRight size={16} />
          </SmartLink>
        </Reveal>
      ) : null}
    </div>
  )
}
