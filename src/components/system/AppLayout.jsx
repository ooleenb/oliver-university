import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import Crest from '../Crest.jsx'
import { useAuth } from '../../auth.jsx'
import { university } from '../../data/mock.js'

const ROLE_LABEL = {
  applicant: 'Applicant',
  student: 'Student',
  admissions: 'Admissions Office',
  admin: 'Administrator',
}

function Sidebar({ menu, subtitle, user, onNavigate }) {
  return (
    <>
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <Crest size={40} tone="onDark" />
        <span className="text-white font-serif font-semibold leading-tight">
          {university.name}
          <span className="block text-[11px] text-white/50 font-sans">{subtitle}</span>
        </span>
      </Link>

      <nav className="flex-1 p-3 overflow-y-auto">
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
          <span className="grid place-items-center w-9 h-9 rounded-full bg-gold text-ink font-semibold text-sm uppercase">
            {(user?.name || '?').slice(0, 2)}
          </span>
          <span className="text-sm leading-tight min-w-0">
            <span className="block text-white font-semibold truncate">{user?.name}</span>
            <span className="block text-white/50 text-xs">{ROLE_LABEL[user?.role] || user?.role}</span>
          </span>
        </div>
      </div>
    </>
  )
}

// 通用后台外壳：侧边栏 + 顶栏 + 内容出口
export default function AppLayout({ menu, subtitle, topRight }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function onLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-grey-50 flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-ink sticky top-0 h-screen">
        <Sidebar menu={menu} subtitle={subtitle} user={user} />
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex flex-col bg-ink h-full">
            <Sidebar menu={menu} subtitle={subtitle} user={user} onNavigate={() => setOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-grey-200">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button
              className="lg:hidden grid place-items-center w-10 h-10 text-ink"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Icon name="menu" />
            </button>
            <div className="hidden lg:block text-sm text-grey-600">{ROLE_LABEL[user?.role]} · {university.name}</div>
            <div className="flex items-center gap-2">
              {topRight}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-ink hover:bg-grey-100 transition-colors"
              >
                <Icon name="logout" size={18} />
                Sign out
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
