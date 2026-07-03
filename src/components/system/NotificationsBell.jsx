import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { api } from '../../lib/api.js'

export default function NotificationsBell() {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  async function load() {
    try {
      const { notifications, unread } = await api.notifications.list()
      setItems(notifications)
      setUnread(unread)
    } catch {
      /* 忽略 */
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 20000) // 轮询模拟实时
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      await api.notifications.readAll()
      setUnread(0)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative grid place-items-center w-10 h-10 rounded-full text-ink hover:bg-grey-100 transition-colors"
        aria-label="Notifications"
      >
        <Icon name="bell" size={20} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-grey-200 bg-white shadow-lg z-50">
          <div className="px-4 py-3 border-b border-grey-100 font-semibold text-ink">Notifications</div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-grey-500 text-center">No notifications yet</p>
          ) : (
            <ul className="divide-y divide-grey-100">
              {items.map((n) => (
                <li key={n.id} className="px-4 py-3">
                  <p className="text-sm text-ink">{n.text}</p>
                  <p className="text-xs text-grey-400 mt-0.5">{n.created_at}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
