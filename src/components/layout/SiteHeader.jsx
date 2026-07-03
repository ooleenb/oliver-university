import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../Icon.jsx'
import Crest from '../Crest.jsx'
import { useAuth, HOME_BY_ROLE } from '../../auth.jsx'
import { university, utilityNav, mainNav } from '../../data/mock.js'

function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <Crest size={42} className="shrink-0" />
      <span className="leading-tight">
        <span className={`block font-serif text-lg font-semibold ${light ? 'text-white' : 'text-ink'}`}>
          {university.name}
        </span>
        <span className={`block text-xs ${light ? 'text-white/70' : 'text-grey-600'}`}>
          {university.motto}
        </span>
      </span>
    </Link>
  )
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const portalHref = user ? HOME_BY_ROLE[user.role] || '/apply' : null

  function submitSearch(e) {
    e.preventDefault()
    navigate(q.trim() ? `/courses?q=${encodeURIComponent(q.trim())}` : '/courses')
    setSearchOpen(false)
    setOpen(false)
    setQ('')
  }

  return (
    <header className="relative z-40">
      {/* 顶部实用导航（深色细条） */}
      <div className="hidden lg:block bg-ink text-white/80">
        <div className="container-page flex justify-end">
          <ul className="flex items-center gap-6 py-2 text-xs">
            {utilityNav.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="link-underline hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              {user ? (
                <Link to={portalHref} className="link-underline hover:text-white transition-colors">
                  {user.name?.split(' ')[0] || 'My account'} →
                </Link>
              ) : (
                <Link to="/login" className="link-underline hover:text-white transition-colors">
                  Sign in
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* 主导航 */}
      <div className="bg-white border-b border-grey-200">
        <div className="container-page flex items-center justify-between py-4">
          <Logo />

          <nav className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {mainNav.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="link-underline text-[15px] font-semibold text-ink hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  className={`grid place-items-center w-10 h-10 rounded-full transition-colors ${
                    searchOpen ? 'bg-ink text-white' : 'bg-grey-100 text-ink hover:bg-grey-200'
                  }`}
                  aria-label="Search"
                >
                  <Icon name={searchOpen ? 'close' : 'search'} size={20} />
                </button>
              </li>
              <li>
                {user ? (
                  <Link
                    to={portalHref}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-ink-700 transition-colors"
                  >
                    My portal <Icon name="arrow" size={16} />
                  </Link>
                ) : (
                  <Link
                    to="/apply-now"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-primary-dark transition-colors"
                  >
                    Apply <Icon name="arrow" size={16} />
                  </Link>
                )}
              </li>
            </ul>
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            className="lg:hidden grid place-items-center w-10 h-10 text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>

        {/* 搜索展开面板（桌面端） */}
        {searchOpen && (
          <div className="hidden lg:block border-t border-grey-100 bg-white">
            <form onSubmit={submitSearch} className="container-page py-4 flex gap-2">
              <div className="relative flex-1">
                <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for a course, unit or faculty…"
                  className="w-full rounded-full border border-grey-200 bg-white pl-12 pr-4 py-3 text-ink outline-none focus:border-ink transition-colors"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-ink px-7 py-3 font-semibold text-white hover:bg-ink-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* 移动端下拉 */}
        {open && (
          <div className="lg:hidden border-t border-grey-200 bg-white">
            <ul className="container-page py-3">
              <li className="pb-2">
                <form onSubmit={submitSearch} className="relative">
                  <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Find a course…"
                    className="w-full rounded-full border border-grey-200 bg-white pl-10 pr-4 py-2.5 text-ink outline-none focus:border-ink transition-colors"
                  />
                </form>
              </li>
              {mainNav.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="block py-2.5 font-semibold text-ink" onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-3 mt-2 border-t border-grey-100">
                {user ? (
                  <Link
                    to={portalHref}
                    className="block rounded-full bg-ink px-5 py-2.5 text-center font-semibold text-white"
                    onClick={() => setOpen(false)}
                  >
                    Go to my portal →
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/apply-now"
                      className="block rounded-full bg-primary px-5 py-2.5 text-center font-semibold text-white"
                      onClick={() => setOpen(false)}
                    >
                      Apply now →
                    </Link>
                    <Link
                      to="/login"
                      className="block py-2.5 mt-1 text-center font-semibold text-ink"
                      onClick={() => setOpen(false)}
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
