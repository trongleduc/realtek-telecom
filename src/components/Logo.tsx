import { Img } from './Img'

type Props = {
  logo?: unknown
  tone?: 'dark' | 'light'
  className?: string
  name?: string
}

/** Uploaded logo when configured, otherwise a typographic wordmark. */
export function Logo({ logo, tone = 'dark', className = '', name = 'Realtek Telecom' }: Props) {
  if (logo && typeof logo === 'object') {
    return (
      <span className={`relative block h-11 w-40 ${className}`}>
        <Img media={logo} fill sizes="160px" className="object-contain object-left" alt={name} priority />
      </span>
    )
  }

  const main = tone === 'light' ? 'text-white' : 'text-brand'
  return (
    <span className={`inline-flex items-center gap-3 ${main} ${className}`} aria-label={name}>
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect x="1" y="1" width="38" height="38" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 29V11h9.5a5.5 5.5 0 0 1 0 11H11" stroke="currentColor" strokeWidth="2" />
        <path d="m19.5 22 8 7" stroke="var(--color-accent)" strokeWidth="2" />
        <circle cx="29" cy="11" r="1.6" fill="var(--color-accent)" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-bold tracking-[0.2em]">REALTEK</span>
        <span className="mt-1 font-display text-[9.5px] font-medium tracking-[0.46em] opacity-80">TELECOM</span>
      </span>
    </span>
  )
}
