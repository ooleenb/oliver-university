import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import Icon from '../../components/Icon.jsx'
import { Card, StatusBadge, Spinner, Alert } from '../../components/system/ui.jsx'

// 把结构化地址拼成一行可读文本（兼容旧的纯字符串地址）
function formatAddress(a) {
  if (!a) return ''
  if (typeof a === 'string') return a
  if (a.mode === 'OS') {
    return [a.line1, a.line2, a.city, a.region, a.postcode, a.country].filter(Boolean).join(', ')
  }
  const street = [a.unit && `Unit ${a.unit}`, [a.streetNo, a.street].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return [street, a.suburb, a.state, a.postcode].filter(Boolean).join(', ')
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-grey-100 last:border-0">
      <span className="text-sm text-grey-500">{label}</span>
      <span className="text-sm font-medium text-ink text-right">{value || '—'}</span>
    </div>
  )
}

export default function AdmissionsReview() {
  const { id } = useParams()
  const [app, setApp] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notes, setNotes] = useState('')
  const [offerType, setOfferType] = useState('unconditional')
  const [conditions, setConditions] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  function load() {
    api.applications.get(id).then((d) => setApp(d.application)).catch(() => setApp(false))
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (app === false) return <Alert>Application not found.</Alert>
  if (!app) return <Spinner />

  const isFinal = ['accepted', 'declined', 'rejected'].includes(app.status)
  const hasOffer = app.status === 'offer_issued'
  // 兼容旧数据（academic 可能是对象）与新数据（数组）
  const academicList = Array.isArray(app.academic)
    ? app.academic.filter((r) => r && (r.institution || r.qualification))
    : app.academic && Object.keys(app.academic).length
      ? [{ institution: app.academic.prevSchool, qualification: app.academic.degree, result: app.academic.gpa }]
      : []

  async function act(fn, successText) {
    setBusy(true)
    setMsg(null)
    try {
      const { application } = await fn()
      setApp(application)
      setMsg({ kind: 'success', text: successText })
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <Link to="/admissions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-grey-600 hover:text-ink mb-4">
        <Icon name="arrow" size={16} className="rotate-180" /> Back to applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Application #{app.id} · {app.program.code}
          </span>
          <h1 className="display-serif text-3xl text-ink mt-1">{app.applicant.name}</h1>
          <p className="text-grey-600">{app.applicant.email}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {msg && <div className="mb-5"><Alert kind={msg.kind}>{msg.text}</Alert></div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧：申请内容 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3">Program</h2>
            <Row label="Program" value={app.program.name} />
            <Row label="Level" value={app.program.level} />
            <Row label="Faculty" value={app.program.faculty} />
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3">Personal details</h2>
            <Row label="Title" value={app.personal.title} />
            <Row label="Date of birth" value={app.personal.dob} />
            <Row label="Gender" value={app.personal.gender} />
            <Row label="Nationality" value={app.personal.nationality} />
            <Row label="Country of birth" value={app.personal.countryOfBirth} />
            <Row label="Phone" value={app.personal.phone} />
            <Row label="Address" value={formatAddress(app.personal.address)} />
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3">Academic history</h2>
            {academicList.length === 0 ? (
              <p className="text-sm text-grey-500">No academic history provided.</p>
            ) : (
              academicList.map((r, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  {academicList.length > 1 && (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-grey-400">
                      Qualification {i + 1}
                    </p>
                  )}
                  <Row label="Institution" value={r.institution} />
                  <Row label="Country" value={r.country} />
                  <Row label="Qualification" value={r.qualification} />
                  <Row label="Field of study" value={r.field} />
                  <Row label="Years" value={[r.startYear, r.current ? 'present' : r.endYear].filter(Boolean).join(' – ')} />
                  <Row label="Result" value={r.result} />
                </div>
              ))
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3">Personal statement</h2>
            <p className="text-sm text-grey-700 whitespace-pre-wrap leading-relaxed">{app.statement || '—'}</p>
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3">Documents</h2>
            {app.documents.length === 0 ? (
              <p className="text-sm text-grey-500">No documents uploaded.</p>
            ) : (
              <ul className="divide-y divide-grey-100">
                {app.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-3">
                    <Icon name="file" size={20} className="text-grey-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{d.original_name}</p>
                      <p className="text-xs text-grey-500">{d.type}</p>
                    </div>
                    <button
                      onClick={() => api.applications.downloadDoc(id, d.id, d.original_name)}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* 右侧：审核操作 */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <h2 className="font-serif text-lg font-semibold text-ink mb-4">Decision</h2>

            {isFinal ? (
              <p className="text-sm text-grey-600">
                This application is finalised ({app.status}). No further action required.
              </p>
            ) : hasOffer ? (
              <div className="space-y-3">
                <p className="text-sm text-grey-600">
                  An offer has been issued. Awaiting the applicant's response.
                </p>
                {app.offer && (
                  <button
                    onClick={() => api.offers.letter(app.offer.id, `Offer_${app.program.code}_${app.offer.id}.pdf`)}
                    className="inline-flex items-center gap-2 rounded-lg border border-grey-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-grey-50 transition-colors"
                  >
                    <Icon name="file" size={16} /> Preview offer letter
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {app.status === 'submitted' && (
                  <button
                    onClick={() => act(() => api.applications.review(id, { action: 'start' }), 'Marked as under review.')}
                    disabled={busy}
                    className="w-full rounded-lg bg-ink py-2.5 font-semibold text-white hover:bg-ink-700 transition-colors disabled:opacity-60"
                  >
                    Start review
                  </button>
                )}

                {/* 要求补材料 */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Request more information</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="What is missing?"
                    className="w-full rounded-lg border border-grey-200 px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <button
                    onClick={() => act(() => api.applications.review(id, { action: 'request_info', notes }), 'Information requested.')}
                    disabled={busy || !notes.trim()}
                    className="mt-2 w-full rounded-lg border border-grey-300 py-2 text-sm font-semibold text-ink hover:bg-grey-50 transition-colors disabled:opacity-50"
                  >
                    Send request
                  </button>
                </div>

                <hr className="border-grey-100" />

                {/* 发 offer */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Issue an offer</label>
                  <select
                    value={offerType}
                    onChange={(e) => setOfferType(e.target.value)}
                    className="w-full rounded-lg border border-grey-200 px-3 py-2 text-sm outline-none focus:border-ink mb-2"
                  >
                    <option value="unconditional">Unconditional</option>
                    <option value="conditional">Conditional</option>
                  </select>
                  {offerType === 'conditional' && (
                    <textarea
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      rows={2}
                      placeholder="Conditions (e.g. final GPA ≥ 3.5)"
                      className="w-full rounded-lg border border-grey-200 px-3 py-2 text-sm outline-none focus:border-ink mb-2"
                    />
                  )}
                  <button
                    onClick={() =>
                      act(
                        () => api.applications.decision(id, { decision: 'approve', offerType, conditions }),
                        'Offer issued!'
                      )
                    }
                    disabled={busy}
                    className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
                  >
                    Approve & issue offer
                  </button>
                </div>

                <hr className="border-grey-100" />

                {/* 拒绝 */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Reject application</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    placeholder="Internal reason (optional)"
                    className="w-full rounded-lg border border-grey-200 px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <button
                    onClick={() =>
                      act(
                        () => api.applications.decision(id, { decision: 'reject', conditions: rejectReason }),
                        'Application rejected.'
                      )
                    }
                    disabled={busy}
                    className="mt-2 w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
