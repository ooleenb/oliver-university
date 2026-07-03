import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { Card, PageHeader, EmptyState, Spinner } from '../../components/system/ui.jsx'

export default function AdminAudit() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    api.admin.audit().then((d) => setRows(d.audit)).catch(() => setRows([]))
  }, [])

  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="Security" title="Audit log" sub="A record of significant actions across the system." />
      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Card><EmptyState icon="shield" title="No activity yet" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-grey-100">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-sand text-primary text-xs font-bold shrink-0 uppercase">
                  {(r.actor_name || 'SYS').slice(0, 2)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{r.actor_name || 'System'}</span>{' '}
                    <span className="text-grey-600">{r.action}</span>
                    {r.entity && <span className="text-grey-400"> · {r.entity} #{r.entity_id}</span>}
                  </p>
                </div>
                <span className="text-xs text-grey-400 shrink-0">{r.created_at}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
