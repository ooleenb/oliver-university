// 轻量内联 SVG 图标集，避免引入图标库
const paths = {
  search: 'M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M6 6l12 12M18 6L6 18',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16 8l-2 6-6 2 2-6 6-2z',
  bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z',
  handshake: 'M12 8l3-2 5 4v5l-3 3-4-3M12 8l-3-2-5 4v5l3 3 4-3M12 8v8',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  book: 'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5zM8 3v14',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .5a7 7 0 0 0-1.4-1.4L18 3l-3-1-1 2a7 7 0 0 0-2 0L11 2 8 3l.8 2.1A7 7 0 0 0 7.4 6.5L5 6 4 9l2 1a7 7 0 0 0 0 2l-2 1 1 3 2.4-.5a7 7 0 0 0 1.4 1.4L8 21l3 1 1-2a7 7 0 0 0 2 0l1 2 3-1-.8-2.1a7 7 0 0 0 1.4-1.4L21 15l-1-3-1 .5z',
  gavel: 'M14 3l7 7-3 3-7-7 3-3zM11 6L4 13l3 3 7-7M3 21h10',
  heart: 'M12 21l-1.5-1.4C5 14.7 2 12 2 8.5 2 6 4 4 6.5 4c1.5 0 3 .7 3.9 1.9L12 8l1.6-2.1C14.5 4.7 16 4 17.5 4 20 4 22 6 22 8.5c0 3.5-3 6.2-8.5 11.1L12 21z',
  note: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  atom: 'M12 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM20 12c0 3-3.6 4-8 4s-8-1-8-4 3.6-4 8-4 8 1 8 4zM8.5 4.5c2 2.6 3.5 6 4 9.5M15.5 4.5c-2 2.6-3.5 6-4 9.5',
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  courses: 'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5zM8 3v14',
  calendar: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
  grades: 'M12 15l-5 3 1.5-5.5L4 9h6l2-6 2 6h6l-4.5 3.5L17 18z',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 21a9 9 0 0 1 18 0',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2',
  pin: 'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  file: 'M6 2h8l4 4v16H6zM14 2v4h4M9 13h6M9 17h6',
  check: 'M20 6L9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5 5h14l3 7v6H2v-6l3-7z',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01',
  chevron: 'M6 9l6 6 6-6',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14M10 11v6M14 11v6',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z',
}

export default function Icon({ name, size = 24, className = '', strokeWidth = 1.6 }) {
  const d = paths[name]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
