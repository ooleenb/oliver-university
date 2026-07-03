import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import Icon from '../../components/Icon.jsx'
import { Card, PageHeader, StatusBadge, Spinner } from '../../components/system/ui.jsx'

function Stat({ icon, value, label }) {
  return (
    <Card className="p-5">
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-sand text-primary mb-3">
        <Icon name={icon} size={22} />
      </span>
      <p className="font-serif text-3xl font-semibold text-ink">{value}</p>
      <p className="text-sm text-grey-600 mt-0.5">{label}</p>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.admin.stats().then(setStats).catch(() => setStats(false))
  }, [])

  if (stats === false) return <p className="text-grey-600">Failed to load stats.</p>
  if (!stats) return <Spinner />

  const byStatus = stats.applications.byStatus || {}

  return (
    <div className="max-w-5xl">
      <PageHeader eyebrow="Overview" title="Administration dashboard" sub="A live snapshot of the university system." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon="users" value={stats.users.total} label="Total users" />
        <Stat icon="user" value={stats.users.students} label="Students" />
        <Stat icon="inbox" value={stats.applications.total} label="Applications" />
        <Stat icon="file" value={stats.offers.accepted} label="Offers accepted" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">Applications by status</h2>
          {Object.keys(byStatus).length === 0 ? (
            <p className="text-sm text-grey-500">No applications yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {Object.entries(byStatus).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="font-semibold text-ink">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">Community</h2>
          <ul className="space-y-2.5 text-sm">
            <li className="flex justify-between"><span className="text-grey-600">Applicants</span><span className="font-semibold text-ink">{stats.users.applicants}</span></li>
            <li className="flex justify-between"><span className="text-grey-600">Students</span><span className="font-semibold text-ink">{stats.users.students}</span></li>
            <li className="flex justify-between"><span className="text-grey-600">Staff</span><span className="font-semibold text-ink">{stats.users.staff}</span></li>
            <li className="flex justify-between"><span className="text-grey-600">Programs offered</span><span className="font-semibold text-ink">{stats.programs}</span></li>
            <li className="flex justify-between"><span className="text-grey-600">Offers issued</span><span className="font-semibold text-ink">{stats.offers.issued}</span></li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
