import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import Icon from '../../components/Icon.jsx'
import { Card, PageHeader, Spinner, Alert } from '../../components/system/ui.jsx'

const LEVELS = ['All', 'Undergraduate', 'Postgraduate', 'Research']

export default function Programs() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState(null)
  const [level, setLevel] = useState('All')
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    const params = new URLSearchParams()
    if (level !== 'All') params.set('level', level)
    if (q.trim()) params.set('q', q.trim())
    const qs = params.toString()
    api.programs.list(qs ? `?${qs}` : '').then((d) => setPrograms(d.programs)).catch(() => setPrograms([]))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  async function apply(program) {
    setErr('')
    setBusyId(program.id)
    try {
      const { application } = await api.applications.create(program.id)
      navigate(`/apply/applications/${application.id}`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader eyebrow="Course finder" title="Browse programs" sub="Choose a program and start your application." />

      {err && <div className="mb-4"><Alert>{err}</Alert></div>}

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search by name or faculty…"
            className="w-full rounded-full border border-grey-200 bg-white pl-11 pr-4 py-2.5 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                level === l ? 'bg-ink text-white' : 'bg-white border border-grey-200 text-ink hover:border-ink'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {programs === null ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.id} className="card-lift p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.code}</span>
                <span className="text-xs text-grey-400">·</span>
                <span className="text-xs text-grey-500">{p.level}</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-ink leading-snug">{p.name}</h3>
              <p className="text-sm text-grey-600 mt-2 flex-1">{p.description}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-grey-600 mt-4">
                <span className="inline-flex items-center gap-1.5"><Icon name="building" size={15} /> {p.faculty}</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={15} /> {p.duration}</span>
                {p.tuition != null && (
                  <span className="inline-flex items-center gap-1.5"><Icon name="chart" size={15} /> ${p.tuition.toLocaleString()}/yr</span>
                )}
              </div>
              <button
                onClick={() => apply(p)}
                disabled={busyId === p.id}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {busyId === p.id ? 'Starting…' : 'Apply now'}
                <Icon name="arrow" size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
