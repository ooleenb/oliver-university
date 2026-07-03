import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../Icon.jsx'

// 可搜索的下拉选择（静态字符串选项）。用于国籍、出生国、性别、学历等级、州、年份等。
export default function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const boxRef = useRef(null)

  // 点击外部关闭
  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options.slice(0, 80)
    const starts = []
    const contains = []
    for (const o of options) {
      const s = o.toLowerCase()
      if (s.startsWith(q)) starts.push(o)
      else if (s.includes(q)) contains.push(o)
      if (starts.length >= 80) break
    }
    return [...starts, ...contains].slice(0, 80)
  }, [query, options])

  function select(opt) {
    onChange(opt)
    setQuery('')
    setOpen(false)
  }

  const base =
    'w-full rounded-lg border bg-white px-4 py-2.5 outline-none transition-colors flex items-center justify-between gap-2 text-left'

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`${base} ${disabled ? 'border-grey-200 bg-grey-50 text-grey-400 cursor-not-allowed' : 'border-grey-200 focus:border-ink hover:border-grey-300'}`}
      >
        <span className={value ? 'text-ink' : 'text-grey-400'}>{value || placeholder}</span>
        <Icon name="chevron" size={18} className="text-grey-400 shrink-0" />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-grey-200 bg-white shadow-lg">
          <div className="p-2 border-b border-grey-100">
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)) }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
                else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) select(filtered[active]) }
                else if (e.key === 'Escape') setOpen(false)
              }}
              placeholder="Type to search…"
              className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-grey-400">No matches</li>
            ) : (
              filtered.map((o, i) => (
                <li key={o}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(o)}
                    className={`w-full text-left px-4 py-2 text-sm ${i === active ? 'bg-sand text-ink' : 'text-grey-700 hover:bg-grey-50'} ${o === value ? 'font-semibold' : ''}`}
                  >
                    {o}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
