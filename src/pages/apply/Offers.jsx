import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import Icon from '../../components/Icon.jsx'
import { Card, PageHeader, StatusBadge, EmptyState, Spinner } from '../../components/system/ui.jsx'

export default function Offers() {
  const [offers, setOffers] = useState(null)
  const [apps, setApps] = useState([])

  useEffect(() => {
    api.offers.mine().then((d) => setOffers(d.offers)).catch(() => setOffers([]))
    api.applications.mine().then((d) => setApps(d.applications)).catch(() => {})
  }, [])

  // 通过 program 关联回申请，便于跳转到详情作出响应
  function appForOffer(o) {
    return apps.find((a) => a.offer && a.offer.id === o.id)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Decisions" title="My offers" sub="Review and respond to your offers of admission." />
      {offers === null ? (
        <Spinner />
      ) : offers.length === 0 ? (
        <Card>
          <EmptyState icon="file" title="No offers yet" sub="Offers will appear here once the admissions team reviews your applications." />
        </Card>
      ) : (
        <ul className="space-y-3">
          {offers.map((o) => {
            const app = appForOffer(o)
            return (
              <Card key={o.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">{o.program.code}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="font-serif text-lg font-semibold text-ink">{o.program.name}</p>
                  <p className="text-sm text-grey-600 capitalize">{o.type} offer · issued {o.issued_at}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => api.offers.letter(o.id, `Offer_${o.program.code}_${o.id}.pdf`)}
                    className="inline-flex items-center gap-2 rounded-full border border-grey-300 px-5 py-2.5 font-semibold text-ink hover:bg-grey-50 transition-colors"
                  >
                    <Icon name="file" size={16} /> Letter
                  </button>
                  {o.status === 'issued' && app && (
                    <a
                      href={`/apply/applications/${app.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink-700 transition-colors"
                    >
                      Respond <Icon name="arrow" size={16} />
                    </a>
                  )}
                </div>
              </Card>
            )
          })}
        </ul>
      )}
    </div>
  )
}
