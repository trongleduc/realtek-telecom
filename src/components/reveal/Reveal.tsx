'use client'

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'

import { observeReveal } from './observer'

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'blur' | 'mask' | 'mask-x' | 'none'

type Props = {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  /** Keep visible after the first reveal instead of hiding again when scrolled away. */
  once?: boolean
  as?: ElementType
  className?: string
  innerClassName?: string
  style?: CSSProperties
}

export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  once = false,
  as: Tag = 'div',
  className,
  innerClassName,
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    return observeReveal(ref.current)
  }, [])

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-reveal-once={once ? '' : undefined}
      className={className}
      style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      <div className={['reveal-inner', innerClassName].filter(Boolean).join(' ')}>{children}</div>
    </Tag>
  )
}

/** Observes an element that styles its own children (e.g. the fan-out card row) via `[data-shown]`. */
export function useRevealRef<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!ref.current) return
    return observeReveal(ref.current)
  }, [])
  return ref
}
