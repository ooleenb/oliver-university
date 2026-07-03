// 后台通用小组件：状态徽章、卡片、区块标题、空状态、加载态。
import Icon from '../Icon.jsx'

// 申请/offer 状态的颜色与文案
const STATUS_STYLE = {
  draft: { label: 'Draft', cls: 'bg-grey-100 text-grey-600' },
  submitted: { label: 'Submitted', cls: 'bg-blue-50 text-blue-700' },
  under_review: { label: 'Under review', cls: 'bg-amber-50 text-amber-700' },
  info_requested: { label: 'Info requested', cls: 'bg-orange-50 text-orange-700' },
  offer_issued: { label: 'Offer issued', cls: 'bg-emerald-50 text-emerald-700' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-100 text-emerald-800' },
  declined: { label: 'Declined', cls: 'bg-grey-100 text-grey-600' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700' },
  // offer 状态
  issued: { label: 'Awaiting response', cls: 'bg-emerald-50 text-emerald-700' },
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { label: status, cls: 'bg-grey-100 text-grey-600' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-grey-200 bg-white ${className}`}>{children}</div>
}

export function PageHeader({ eyebrow, title, sub, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <span className="eyebrow mb-2">{eyebrow}</span>}
        <h1 className="display-serif text-3xl md:text-4xl text-ink">{title}</h1>
        {sub && <p className="text-grey-600 mt-1.5">{sub}</p>}
      </div>
      {actions}
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, sub }) {
  return (
    <div className="grid place-items-center py-16 text-center">
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-grey-100 text-grey-400 mb-4">
        <Icon name={icon} size={28} />
      </span>
      <p className="font-serif text-lg font-semibold text-ink">{title}</p>
      {sub && <p className="text-grey-600 mt-1 max-w-sm">{sub}</p>}
    </div>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return <div className="py-16 text-center text-grey-500 animate-pulse">{label}</div>
}

export function Alert({ kind = 'error', children }) {
  const cls =
    kind === 'error'
      ? 'bg-red-50 text-red-700 border-red-200'
      : kind === 'success'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-blue-50 text-blue-700 border-blue-200'
  return <div className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>
}
