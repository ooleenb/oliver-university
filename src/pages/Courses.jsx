import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../auth.jsx'
import Icon from '../components/Icon.jsx'

const LEVELS = ['All', 'Undergraduate', 'Postgraduate', 'Research']

// 公开的“课程/专业检索”页：任何访客都可搜索开放的专业
export default function Courses() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const level = params.get('level') || 'All'

  const [input, setInput] = useState(q)
  const [programs, setPrograms] = useState(null)

  // URL 变化时同步搜索框
  useEffect(() => setInput(q), [q])

  useEffect(() => {
    const search = new URLSearchParams()
    if (level !== 'All') search.set('level', level)
    if (q.trim()) search.set('q', q.trim())
    const qs = search.toString()
    setPrograms(null)
    api.programs
      .list(qs ? `?${qs}` : '')
      .then((d) => setPrograms(d.programs))
      .catch(() => setPrograms([]))
  }, [q, level])

  function setParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  function onSubmit(e) {
    e.preventDefault()
    setParam('q', input.trim())
  }

  const applyHref = user && (user.role === 'applicant' || user.role === 'student') ? '/apply/programs' : '/apply-now'

  return (
    <>
      {/* 顶部横幅 + 搜索 */}
      <section className="bg-ink text-white">
        <div className="container-page py-16 md:py-20">
          <span className="eyebrow eyebrow--on-dark mb-5">Course finder</span>
          <h1 className="display-serif text-4xl md:text-5xl mb-4 max-w-2xl">Find a course</h1>
          <p className="text-white/80 mb-8 max-w-lg">
            Explore undergraduate, postgraduate and research programs across ten faculties.
          </p>
          <form onSubmit={onSubmit} className="max-w-2xl flex gap-2">
            <div className="relative flex-1">
              <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search by name, faculty or code"
                className="w-full rounded-full border border-transparent bg-white pl-12 pr-4 py-3.5 text-ink outline-none focus:border-gold transition-colors"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-primary px-8 py-3.5 font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page section-y">
          {/* 层级筛选 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setParam('level', l === 'All' ? '' : l)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    level === l ? 'bg-ink text-white' : 'bg-white border border-grey-200 text-ink hover:border-ink'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            {programs !== null && (
              <p className="text-sm text-grey-500">
                {programs.length} {programs.length === 1 ? 'program' : 'programs'}
                {q.trim() && (
                  <>
                    {' '}for “<span className="text-ink font-semibold">{q.trim()}</span>”
                  </>
                )}
              </p>
            )}
          </div>

          {programs === null ? (
            <div className="py-16 text-center text-grey-500 animate-pulse">Loading…</div>
          ) : programs.length === 0 ? (
            <div className="grid place-items-center py-20 text-center">
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-grey-100 text-grey-400 mb-4">
                <Icon name="search" size={28} />
              </span>
              <p className="font-serif text-lg font-semibold text-ink">No programs found</p>
              <p className="text-grey-600 mt-1 max-w-sm">
                We couldn’t find any programs matching your search. Try a different term or browse all courses.
              </p>
              <button
                onClick={() => setParams({}, { replace: true })}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-grey-200 px-5 py-2.5 font-semibold text-ink hover:border-ink transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((p) => (
                <Link
                  key={p.id}
                  to={`/courses/${p.id}`}
                  className="card-lift group flex flex-col rounded-2xl border border-grey-200 bg-white p-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.code}</span>
                    <span className="text-xs text-grey-400">·</span>
                    <span className="text-xs text-grey-500">{p.level}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-ink leading-snug group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm text-grey-600 mt-2 line-clamp-3 flex-1">{p.description}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-grey-600 mt-4">
                    <span className="inline-flex items-center gap-1.5"><Icon name="building" size={15} /> {p.faculty}</span>
                    <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={15} /> {p.duration}</span>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-primary group-hover:gap-2.5 transition-all">
                    View details <Icon name="arrow" size={15} />
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* 底部 CTA */}
          <div className="mt-16 rounded-2xl bg-sand p-8 md:p-10 text-center">
            <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Ready to apply?</h2>
            <p className="text-grey-600 mb-6 max-w-lg mx-auto">
              Applications are free and take just a few minutes to start. Choose a program and begin your journey.
            </p>
            <Link
              to={applyHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Start an application <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
