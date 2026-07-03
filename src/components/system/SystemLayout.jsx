import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import Crest from '../Crest.jsx'
import AvatarUploader from './AvatarUploader.jsx'
import { useAuth } from '../../auth.jsx'
import { university } from '../../data/mock.js'

const menu = [
  { to: '/portal', label: 'Dashboard', icon: 'home', end: true },
  { to: '/portal/courses', label: 'My Courses', icon: 'courses' },
  { to: '/portal/timetable', label: 'Timetable', icon: 'calendar' },
  { to: '/portal/grades', label: 'Grades', icon: 'grades' },
]

function SidebarContent({ onNavigate, user }) {
  return (
    <>
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <Crest size={40} tone="onDark" />
        <span className="text-white font-serif font-semibold leading-tight">
          {university.name}
          <span className="block text-[11px] text-white/50 font-sans">Student Portal</span>
        </span>
      </Link>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {menu.map((m) => (
            <li key={m.to}>
              <NavLink
                to={m.to}
                end={m.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon name={m.icon} size={20} />
                {m.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <AvatarUploader size={40} />
          <span className="text-sm leading-tight min-w-0">
            <span className="block text-white font-semibold truncate">{user?.name}</span>
            <span className="block text-white/50 text-xs">{user?.studentNo || 'Student'}</span>
          </span>
        </div>
      </div>
    </>
  )
}

export default function SystemLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function onLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-grey-50 flex">
      {/* 桌面侧边栏 */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-ink sticky top-0 h-screen">
        <SidebarContent user={user} />
      </aside>

      {/* 移动端抽屉 */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex flex-col bg-ink h-full">
            <SidebarContent user={user} onNavigate={() => setOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶栏 */}
        <header className="sticky top-0 z-30 bg-white border-b border-grey-200">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button
              className="lg:hidden grid place-items-center w-10 h-10 text-ink"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Icon name="menu" />
            </button>
            <div className="hidden lg:block">
              <span className="text-sm text-grey-600">
                {university.name} · Student Portal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid place-items-center w-10 h-10 rounded-full text-ink hover:bg-grey-100 transition-colors" aria-label="Notifications">
                <Icon name="bell" size={20} />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-ink hover:bg-grey-100 transition-colors"
              >
                <Icon name="logout" size={18} />
                Exit
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
