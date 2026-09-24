import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }
}

export const ArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)
export const ArrowLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
)
export const ArrowUpRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)
export const ArrowUp = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20V5M6 11l6-6 6 6" />
  </svg>
)
export const Phone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h3.5l1.8 4.4-2.2 1.4a11 11 0 0 0 6.1 6.1l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5C10.7 20 4 13.3 3.5 5.6A1.5 1.5 0 0 1 5 4Z" />
  </svg>
)
export const Mail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
)
export const MapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
)
export const Clock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
export const Search = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)
export const Download = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
)
export const FileIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5L14 3Z" />
    <path d="M14 3v4.5h4.5M9 13h6M9 16.5h6" />
  </svg>
)
export const Menu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
)
export const Close = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const Chevron = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
export const LinkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
)
export const Pause = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 6v12M15 6v12" />
  </svg>
)
export const Play = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" />
  </svg>
)

function brand({ size = 16, ...props }: IconProps) {
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true, ...props }
}

export const Facebook = (p: IconProps) => (
  <svg {...brand(p)}>
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.6V4.4A20 20 0 0 0 14.4 4.3c-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.5V21h2.8Z" />
  </svg>
)
export const Youtube = (p: IconProps) => (
  <svg {...brand(p)}>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </svg>
)
export const Linkedin = (p: IconProps) => (
  <svg {...brand(p)}>
    <path d="M6.9 8.8H3.8V20h3.1V8.8ZM5.3 3.8a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.2 13.6c0-3-1.6-5-4.3-5-1.5 0-2.4.8-2.8 1.5V8.8H10V20h3.1v-5.6c0-1.5.3-2.9 2.1-2.9s1.9 1.7 1.9 3V20h3.1v-6.4Z" />
  </svg>
)
export const Zalo = ({ size = 22, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden {...props}>
    <path
      fill="currentColor"
      d="M24 4C12.4 4 3 12.2 3 22.4c0 5.8 3.1 11 7.9 14.4l-1.3 6.6 6.9-3.8c2.3.7 4.9 1.1 7.5 1.1 11.6 0 21-8.2 21-18.3S35.6 4 24 4Z"
    />
    <text
      x="24"
      y="27.5"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontWeight="700"
      fontSize="12.5"
      fill="var(--zalo-text, #fff)"
    >
      Zalo
    </text>
  </svg>
)
