import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../auth.jsx'
import Icon from '../../components/Icon.jsx'
import { Card, PageHeader, StatusBadge, EmptyState, Spinner } from '../../components/system/ui.jsx'

// 申请状态 → 给申请人的进度提示
const NEXT_STEP = {
  draft: 'Finish and submit your application.',
  submitted: 'Submitted — the admissions team will review it soon.',
  under_review: 'Your application is being reviewed.',
  info_requested: 'Action needed: the team requested more information.',
  offer_issued: 'You have an offer! Review and respond.',
  accepted: 'Accepted — welcome to Oliver University!',
  declined: 'You declined this offer.',
  rejected: 'This application was not successful.',
}

export default function ApplyHome() {
  const { user } = useAuth()
  const [apps, setApps] = useState(null)

  useEffect(() => {
    api.applications.mine().then((d) => setApps(d.applications)).catch(() => setApps([]))
  }, [])

  const pendingOffer = apps?.find((a) => a.status === 'offer_issued')

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Applicant portal"
        title={`Hello, ${user?.name?.split(' ')[0] || 'there'}`}
        sub="Track your applications and respond to offers."
        actions={
          <Link
            to="/apply/programs"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Icon name="plus" size={18} /> New application
          </Link>
        }
      />

      {pendingOffer && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/60">
          <div className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700">
                <Icon name="check" size={26} />
              </span>
              <div>
                <p className="font-serif text-lg font-semibold text-ink">You have an offer!</p>
                <p className="text-sm text-grey-600">{pendingOffer.program.name}</p>
              </div>
            </div>
            <Link
              to={`/apply/applications/${pendingOffer.id}`}
              className="rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink-700 transition-colors"
            >
              Review offer
            </Link>
          </div>
        </Card>
      )}

      <h2 className="font-serif text-xl font-semibold text-ink mb-3">My applications</h2>

      {apps === null ? (
        <Spinner />
      ) : apps.length === 0 ? (
        <Card>
          <EmptyState
            icon="compass"
            title="No applications yet"
            sub="Browse our programs and start your first application."
          />
          <div className="pb-8 text-center">
            <Link to="/apply/programs" className="text-primary font-semibold hover:underline">
              Browse programs →
            </Link>
          </div>
        </Card>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => (
            <li key={a.id}>
              <Link to={`/apply/applications/${a.id}`}>
                <Card className="card-lift p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {a.program.code} · {a.program.level}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="font-serif text-lg font-semibold text-ink truncate">{a.program.name}</p>
                    <p className="text-sm text-grey-600 mt-0.5">{NEXT_STEP[a.status]}</p>
                  </div>
                  <Icon name="arrow" size={20} className="text-grey-400 shrink-0" />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
