import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import Icon from '../../components/Icon.jsx'
import { Card, PageHeader, StatusBadge, EmptyState, Spinner } from '../../components/system/ui.jsx'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'New' },
  { value: 'under_review', label: 'Under review' },
  { value: 'info_requested', label: 'Info requested' },
  { value: 'offer_issued', label: 'Offer issued' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdmissionsQueue() {
  const [apps, setApps] = useState(null)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  function load() {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (q.trim()) params.set('q', q.trim())
    const qs = params.toString()
    api.applications.all(qs ? `?${qs}` : '').then((d) => setApps(d.applications)).catch(() => setApps([]))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <div className="max-w-5xl">
      <PageHeader eyebrow="Admissions" title="Applications" sub="Review submissions and make decisions." />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search applicant name or email…"
            className="w-full rounded-full border border-grey-200 bg-white pl-11 pr-4 py-2.5 outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              status === f.value ? 'bg-ink text-white' : 'bg-white border border-grey-200 text-ink hover:border-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {apps === null ? (
        <Spinner />
      ) : apps.length === 0 ? (
        <Card><EmptyState title="No applications" sub="Nothing matches this filter yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-grey-100">
            {apps.map((a) => (
              <li key={a.id}>
                <Link to={`/admissions/${a.id}`} className="flex items-center gap-4 p-4 hover:bg-grey-50 transition-colors">
                  <span className="grid place-items-center w-11 h-11 rounded-full bg-sand text-primary font-semibold uppercase shrink-0">
                    {a.applicant.name.slice(0, 2)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">{a.applicant.name}</p>
                    <p className="text-sm text-grey-600 truncate">{a.program.name}</p>
                  </div>
                  <div className="hidden sm:block text-right mr-2">
                    <StatusBadge status={a.status} />
                    <p className="text-xs text-grey-400 mt-1">{a.submittedAt || a.createdAt}</p>
                  </div>
                  <Icon name="arrow" size={18} className="text-grey-400 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
