import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { api } from '../../lib/api.js'

// 澳大利亚 suburb 异步自动补全。用户输入 suburb 名字，从后端拉取匹配的
// { suburb, state, postcode } 列表；选中后回调 onSelect，父组件据此回填 state/postcode。
export default function SuburbAutocomplete({ value, onChange, onSelect, disabled = false, placeholder = 'Start typing a suburb…' }) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef(null)
  const seq = useRef(0)

  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // 防抖查询
  useEffect(() => {
    const q = (value || '').trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const mine = ++seq.current
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const { results } = await api.geo.auAddress(q)
        if (mine === seq.current) {
          setResults(results || [])
          setActive(0)
        }
      } catch {
        if (mine === seq.current) setResults([])
      } finally {
        if (mine === seq.current) setLoading(false)
      }
    }, 200)
    return () => clearTimeout(t)
  }, [value])

  function pick(r) {
    onSelect(r)
    setOpen(false)
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        value={value || ''}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
          else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) pick(results[active]) }
          else if (e.key === 'Escape') setOpen(false)
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-grey-200 px-4 py-2.5 outline-none transition-colors focus:border-ink disabled:bg-grey-50 disabled:text-grey-400"
      />
      {open && (value || '').trim().length >= 2 && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-grey-200 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {loading && results.length === 0 ? (
              <li className="px-4 py-2 text-sm text-grey-400">Searching…</li>
            ) : results.length === 0 ? (
              <li className="px-4 py-2 text-sm text-grey-400">No matching suburbs</li>
            ) : (
              results.map((r, i) => (
                <li key={`${r.suburb}-${r.state}-${r.postcode}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(r)}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm ${i === active ? 'bg-sand text-ink' : 'text-grey-700 hover:bg-grey-50'}`}
                  >
                    <span className="font-medium">{r.suburb}</span>
                    <span className="text-xs text-grey-500">{r.state} {r.postcode}</span>
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
