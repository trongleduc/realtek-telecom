import type { ComponentProps, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { isExternalUrl } from '@/lib/site'

type Props = Omit<ComponentProps<'a'>, 'href'> & {
  href?: string | null
  children: ReactNode
  newTab?: boolean
}

/** Internal paths go through the locale-aware Link; anything else is a plain anchor. */
export function SmartLink({ href, children, newTab, ...rest }: Props) {
  if (!href) return <span className={rest.className}>{children}</span>
  if (isExternalUrl(href)) {
    const external = /^https?:/i.test(href)
    return (
      <a
        href={href}
        target={(newTab ?? external) ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} target={newTab ? '_blank' : undefined} {...rest}>
      {children}
    </Link>
  )
}
