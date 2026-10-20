import type { CSSProperties } from 'react'

export type IconName =
  | 'x'
  | 'telegram'
  | 'dexscreener'
  | 'dextools'
  | 'solscan'
  | 'globe'
  | 'copy'
  | 'check'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'play'
  | 'heart'
  | 'reply'
  | 'repost'
  | 'arrow-down'
  | 'external'
  | 'alert'
  | 'image'
  | 'video'
  | 'users'
  | 'archive'
  | 'wand'
  | 'sparkle'
  | 'upload'
  | 'download'
  | 'trash'
  | 'palette'

/**
 * Stroke icons are 24×24 and inherit currentColor.
 * `x`, `telegram` and `dexscreener` use the exact path data from the project's
 * own SVG files in public/assets/icons (they are fill-based, so they use
 * fill="currentColor" instead of stroke).
 */
const STROKE: Record<string, string> = {
  dextools: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-7',
  solscan:
    'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.6 3.2 2.6 14.8 0 18M12 3c-2.6 3.2-2.6 14.8 0 18',
  copy: 'M9 9h10v10H9zM6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1',
  check: 'M4 12.5l5 5L20 6.5',
  close: 'M6 6l12 12M18 6L6 18',
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-right': 'M9 5l7 7-7 7',
  heart:
    'M12 20s-7-4.6-7-9.4A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7 2.9C19 15.4 12 20 12 20z',
  reply: 'M9 15l-4-4 4-4M5 11h8a6 6 0 0 1 6 6v2',
  repost:
    'M7 8H4l3-3M4 8v5a3 3 0 0 0 3 3h1M17 16h3l-3 3M20 16v-5a3 3 0 0 0-3-3h-1',
  'arrow-down': 'M12 4v15M6 13l6 6 6-6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4',
  alert: 'M12 4l9 16H3zM12 10v5M12 18h.01',
  image: 'M4 5h16v14H4zM4 15l5-4 4 3 3-2 4 3',
  video: 'M4 6h11v12H4zM15 10l5-3v10l-5-3',
  users:
    'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6M16 4.6a3.5 3.5 0 0 1 0 6.8M17.6 14.9c2.1.8 3.9 2.5 3.9 5.1',
  archive: 'M4 6h16v14H4zM3 6l2-3h14l2 3M12 10v4l3 2',
  wand: 'M5 19L16 8M14.5 6.5l3 3M18 3l.9 2.1L21 6l-2.1.9L18 9l-.9-2.1L15 6l2.1-.9zM7.5 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L5.5 6.5l1.4-.6zM19 14l.5 1.2 1.2.5-1.2.5L19 17.4l-.5-1.2-1.2-.5 1.2-.5z',
  sparkle: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  upload: 'M12 20V5M6 11l6-6 6 6M4 20h16',
  download: 'M12 4v15M6 13l6 6 6-6M4 20h16',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  palette:
    'M12 3a9 9 0 0 0 0 18c1 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-3.9-4-7.7-9-7.7zM7.5 12.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM10 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM16.5 12.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
}

const FILLED: Record<string, { viewBox: string; d: string[] }> = {
  x: {
    viewBox: '0 0 24 24',
    d: [
      'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    ],
  },
  telegram: {
    viewBox: '0 0 34 28',
    d: [
      'M33.9031 2.54903L28.7723 26.3098C28.3852 27.9868 27.3758 28.4041 25.9413 27.6141L18.1236 21.9571L14.3514 25.5198C13.9339 25.9297 13.5848 26.2725 12.7803 26.2725L13.3419 18.4541L27.8312 5.59739C28.4611 5.04585 27.6945 4.74027 26.852 5.29181L8.93974 16.3672L1.22833 13.9971C-0.449047 13.4829 -0.479407 12.35 1.57747 11.5599L31.74 0.149108C33.1365 -0.365162 34.3585 0.454689 33.9031 2.54903Z',
    ],
  },
  dexscreener: {
    viewBox: '0 0 28 34',
    d: [
      'M5.91994 3.73399C8.87461 0.746798 12.6031 0 14.0981 0V9.8275C12.9347 9.8275 12.3822 10.3882 12.2514 10.6686C6.76414 8.32147 3.98534 3.8229 3.28185 1.867C3.91499 2.72048 5.30439 3.46728 5.91994 3.73399Z',
      'M22.0813 3.73399C19.1266 0.746798 15.3981 0 13.9031 0V9.8275C15.0665 9.8275 15.619 10.3882 15.7498 10.6686C21.2371 8.32147 24.0159 3.8229 24.7194 1.867C24.0862 2.72048 22.6968 3.46728 22.0813 3.73399Z',
      'M7.63493 9.91057C8.46709 10.5449 10.3401 11.888 11.1747 12.1859C9.58555 12.6892 6.65276 12.9388 7.63493 9.91057Z',
      'M6.14156 8.58674C5.6178 8.1896 4.70939 6.91817 4.32065 6.33209C2.80959 7.85979 2.64539 10.8712 2.75218 12.1859C2.75218 22.1107 0.917392 26.7471 0 27.8248L3.8866 24.8226L6.51811 29.216L9.57856 26.5257L14.013 34V31.5371L12.5531 26.5257C11.358 21.1986 7.67152 18.828 5.97767 18.3086L9.57856 16.2401L9.70132 14.5233C4.84011 14.5233 5.30264 10.5656 6.14156 8.58674Z',
      'M20.3651 9.91057C19.5329 10.5449 17.6599 11.888 16.8253 12.1859C18.4144 12.6892 21.3472 12.9388 20.3651 9.91057Z',
      'M21.8584 8.58674C22.3822 8.1896 23.2906 6.91817 23.6793 6.33209C25.1904 7.85979 25.3546 10.8712 25.2478 12.1859C25.2478 22.1107 27.0826 26.7471 28 27.8248L24.1134 24.8226L21.4819 29.216L18.4214 26.5257L13.987 34V31.5371L15.4469 26.5257C16.642 21.1986 20.3285 18.828 22.0223 18.3086L18.4214 16.2401L18.2987 14.5233C23.1599 14.5233 22.6974 10.5656 21.8584 8.58674Z',
      'M11.6321 15.0381C11.6321 13.0761 13.2868 12.1103 14.1141 11.8727V25.5608C14.1141 21.9791 11.2184 19.2586 9.77054 18.346L11.6321 17.1768V15.0381Z',
      'M16.5912 15.0381C16.5912 13.0761 14.9365 12.1103 14.1092 11.8727V25.5608C14.1092 21.9791 17.0049 19.2586 18.4528 18.346L16.5912 17.1768V15.0381Z',
    ],
  },
  play: { viewBox: '0 0 24 24', d: ['M8 5.2v13.6L19 12z'] },
}

interface IconProps {
  name: IconName
  className?: string
  style?: CSSProperties
  title?: string
}

export function Icon({ name, className, style, title }: IconProps) {
  const filled = FILLED[name]

  if (filled) {
    return (
      <svg
        viewBox={filled.viewBox}
        className={['icon', className].filter(Boolean).join(' ')}
        style={{ fill: 'currentColor', stroke: 'none', ...style }}
        role={title ? 'img' : 'presentation'}
        aria-hidden={title ? undefined : true}
        focusable="false"
      >
        {title ? <title>{title}</title> : null}
        {filled.d.map((d) => (
          <path key={d.slice(0, 24)} d={d} />
        ))}
      </svg>
    )
  }

  const d = STROKE[name]
  if (!d) return null

  const filledStroke = name === 'play'

  return (
    <svg
      viewBox="0 0 24 24"
      className={['icon', className].filter(Boolean).join(' ')}
      style={style}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        d={d}
        fill={filledStroke ? 'currentColor' : 'none'}
        stroke={filledStroke ? 'none' : 'currentColor'}
      />
    </svg>
  )
}
