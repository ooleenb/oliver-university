import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../auth.jsx'
import Icon from '../../components/Icon.jsx'
import { Card, StatusBadge, Spinner, Alert } from '../../components/system/ui.jsx'
import SearchSelect from '../../components/apply/SearchSelect.jsx'
import AddressFields from '../../components/apply/AddressFields.jsx'
import AcademicHistory from '../../components/apply/AcademicHistory.jsx'
import DocumentsChecklist, { docRequirements } from '../../components/apply/DocumentsChecklist.jsx'
import { COUNTRIES } from '../../data/countries.js'
import { TITLES, GENDERS } from '../../data/formOptions.js'

function Field({ label, optional, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-grey-400">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-grey-200 bg-white px-4 py-2.5 outline-none focus:border-ink transition-colors disabled:bg-grey-50 disabled:text-grey-400'

// 章节包装（带序号圆点）
function Section({ n, title, subtitle, children }) {
  return (
    <Card className="mb-6 p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">
          {n}
        </span>
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-grey-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  )
}

// 提交前的完整性检查（与后端一致，用于前端提示与禁用）
function validate(personal, academic, statement, documents, program) {
  const problems = []
  const a = personal.address || {}
  if (!personal.dob) problems.push('date of birth')
  if (!personal.gender) problems.push('gender')
  if (!personal.nationality) problems.push('nationality')
  if (!personal.phone) problems.push('phone number')
  if (a.mode === 'OS') {
    if (!a.line1 || !a.city || !a.country) problems.push('residential address')
  } else {
    if (!a.streetNo || !a.street || !a.suburb || !a.state) problems.push('residential address')
  }
  const validAcademic = (academic || []).filter((r) => r.institution && r.qualification)
  if (validAcademic.length === 0) problems.push('at least one academic qualification')
  if (!statement || statement.trim().length < 20) problems.push('personal statement (20+ characters)')

  const req = docRequirements(program)
  const have = new Set((documents || []).map((d) => d.type))
  const missingDocs = Object.entries(req)
    .filter(([type, required]) => required && !have.has(type))
    .map(([type]) => type)
  if (missingDocs.length) problems.push('required documents')

  return problems
}

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refresh } = useAuth()

  const [app, setApp] = useState(null)
  const [personal, setPersonal] = useState({ address: { mode: 'AU' } })
  const [academic, setAcademic] = useState([])
  const [statement, setStatement] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  function hydrate(a) {
    setApp(a)
    const p = a.personal && Object.keys(a.personal).length ? a.personal : {}
    setPersonal({ ...p, address: p.address || { mode: 'AU' } })
    setAcademic(Array.isArray(a.academic) ? a.academic : [])
    setStatement(a.statement || '')
  }

  useEffect(() => {
    api.applications.get(id).then((d) => hydrate(d.application)).catch(() => setApp(false))
  }, [id])

  if (app === false) return <Alert>Application not found.</Alert>
  if (!app) return <Spinner />

  const editable = ['draft', 'info_requested'].includes(app.status)
  const setP = (k, v) => setPersonal((s) => ({ ...s, [k]: v }))

  async function save(silent = false) {
    const { application } = await api.applications.update(id, { personal, academic, statement })
    hydrate(application)
    if (!silent) setMsg({ kind: 'success', text: 'Draft saved.' })
    return application
  }

  async function onSave() {
    setBusy(true); setMsg(null)
    try { await save() } catch (e) { setMsg({ kind: 'error', text: e.message }) } finally { setBusy(false) }
  }

  async function uploadFile(type, file) {
    setBusy(true); setMsg(null)
    try {
      // 先把已填写但未保存的内容持久化，否则上传返回的 application 会用旧数据覆盖表单，导致丢失
      await api.applications.update(id, { personal, academic, statement })
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      const { application } = await api.applications.uploadDoc(id, fd)
      hydrate(application)
      setMsg({ kind: 'success', text: `Uploaded ${file.name}` })
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    } finally { setBusy(false) }
  }

  async function submit() {
    setBusy(true); setMsg(null)
    try {
      await api.applications.update(id, { personal, academic, statement })
      const { application } = await api.applications.submit(id)
      hydrate(application)
      setMsg({ kind: 'success', text: 'Application submitted!' })
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    } finally { setBusy(false) }
  }

  async function downloadLetter() {
    if (!app.offer) return
    setMsg(null)
    try {
      await api.offers.letter(app.offer.id, `Offer_${app.program.code}_${app.offer.id}.pdf`)
    } catch (e) { setMsg({ kind: 'error', text: e.message }) }
  }

  async function respondOffer(action) {
    if (!app.offer) return
    setBusy(true); setMsg(null)
    try {
      if (action === 'accept') {
        const { student } = await api.offers.accept(app.offer.id)
        await refresh() // 角色已变为 student
        navigate('/enrol', { replace: true, state: { student } })
        return
      }
      await api.offers.decline(app.offer.id)
      const { application } = await api.applications.get(id)
      hydrate(application)
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    } finally { setBusy(false) }
  }

  const problems = validate(personal, academic, statement, app.documents, app.program)

  return (
    <div className="max-w-3xl">
      <Link to="/apply" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-grey-600 hover:text-ink">
        <Icon name="arrow" size={16} className="rotate-180" /> Back to overview
      </Link>

      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {app.program.code} · {app.program.level}
          </span>
          <h1 className="display-serif mt-1 text-3xl text-ink">{app.program.name}</h1>
        </div>
        <StatusBadge status={app.status} />
      </div>
      <p className="mb-6 text-grey-600">{app.program.faculty}</p>

      {msg && <div className="mb-5"><Alert kind={msg.kind}>{msg.text}</Alert></div>}

      {app.status === 'info_requested' && app.reviewNotes && (
        <Card className="mb-6 border-orange-200 bg-orange-50/60 p-5">
          <p className="mb-1 font-semibold text-orange-800">Information requested</p>
          <p className="text-sm text-orange-900/80">{app.reviewNotes}</p>
        </Card>
      )}

      {app.offer && app.status === 'offer_issued' && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/60 p-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <Icon name="check" size={24} />
            </span>
            <div>
              <p className="font-serif text-xl font-semibold text-ink">Offer of admission</p>
              <p className="text-sm capitalize text-grey-600">{app.offer.type} offer</p>
            </div>
          </div>
          {app.offer.conditions && (
            <p className="mb-3 text-sm text-grey-700">
              <span className="font-semibold">Conditions:</span> {app.offer.conditions}
            </p>
          )}
          <p className="mb-4 text-sm text-grey-700">
            Accepting this offer will enrol you as a student and give you access to the student portal.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => respondOffer('accept')} disabled={busy} className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60">
              Accept & enrol
            </button>
            <button onClick={() => respondOffer('decline')} disabled={busy} className="rounded-full border border-grey-300 px-6 py-2.5 font-semibold text-ink transition-colors hover:bg-grey-50 disabled:opacity-60">
              Decline
            </button>
            <button onClick={downloadLetter} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-grey-300 px-6 py-2.5 font-semibold text-ink transition-colors hover:bg-grey-50 disabled:opacity-60">
              <Icon name="file" size={18} /> Download offer letter (PDF)
            </button>
          </div>
        </Card>
      )}

      {['accepted', 'declined', 'rejected'].includes(app.status) && (
        <Card className="mb-6 p-5">
          <p className="text-grey-700">
            {app.status === 'accepted' && 'You accepted this offer. Welcome to Oliver University!'}
            {app.status === 'declined' && 'You declined this offer.'}
            {app.status === 'rejected' && 'We are sorry — this application was not successful.'}
          </p>
        </Card>
      )}

      {/* 1. 个人信息 */}
      <Section n={1} title="Personal details" subtitle="Your details as they appear on your passport or ID.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" optional>
            <SearchSelect value={personal.title} onChange={(v) => setP('title', v)} options={TITLES} disabled={!editable} placeholder="Select…" />
          </Field>
          <Field label="Date of birth">
            <input type="date" value={personal.dob || ''} onChange={(e) => setP('dob', e.target.value)} disabled={!editable} className={inputCls} />
          </Field>
          <Field label="Gender">
            <SearchSelect value={personal.gender} onChange={(v) => setP('gender', v)} options={GENDERS} disabled={!editable} placeholder="Select…" />
          </Field>
          <Field label="Phone">
            <input value={personal.phone || ''} onChange={(e) => setP('phone', e.target.value)} disabled={!editable} className={inputCls} placeholder="Phone number" />
          </Field>
          <Field label="Nationality">
            <SearchSelect value={personal.nationality} onChange={(v) => setP('nationality', v)} options={COUNTRIES} disabled={!editable} placeholder="Select country…" />
          </Field>
          <Field label="Country of birth" optional>
            <SearchSelect value={personal.countryOfBirth} onChange={(v) => setP('countryOfBirth', v)} options={COUNTRIES} disabled={!editable} placeholder="Select country…" />
          </Field>
        </div>
      </Section>

      {/* 2. 地址 */}
      <Section n={2} title="Residential address" subtitle="Where do you currently live?">
        <AddressFields value={personal.address} onChange={(address) => editable && setP('address', address)} />
      </Section>

      {/* 3. 学术经历 */}
      <Section n={3} title="Academic history" subtitle="List your qualifications, most recent first.">
        <AcademicHistory value={academic} onChange={setAcademic} disabled={!editable} />
      </Section>

      {/* 4. 个人陈述 */}
      <Section n={4} title="Personal statement" subtitle="Tell us why you want to study this program.">
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          disabled={!editable}
          rows={6}
          className={inputCls}
          placeholder="Describe your motivation, relevant experience and goals (at least 20 characters)…"
        />
      </Section>

      {/* 5. 文件 */}
      <Section n={5} title="Supporting documents" subtitle="Upload clear scans or photos. PDF, JPG or PNG, up to 8 MB each.">
        <DocumentsChecklist
          program={app.program}
          documents={app.documents}
          editable={editable}
          busy={busy}
          onUpload={uploadFile}
          onDownload={(d) => api.applications.downloadDoc(id, d.id, d.original_name)}
        />
      </Section>

      {/* 提交栏 */}
      {editable && (
        <Card className="p-6">
          {problems.length > 0 && (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50/60 p-4">
              <p className="mb-1 text-sm font-semibold text-orange-800">Before you submit, please complete:</p>
              <ul className="list-inside list-disc text-sm text-orange-900/80">
                {problems.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button onClick={onSave} disabled={busy} className="rounded-full border border-grey-300 px-6 py-2.5 font-semibold text-ink transition-colors hover:bg-grey-50 disabled:opacity-60">
              Save draft
            </button>
            <button
              onClick={submit}
              disabled={busy || problems.length > 0}
              className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              title={problems.length > 0 ? 'Complete all required sections first' : undefined}
            >
              {app.status === 'info_requested' ? 'Resubmit application' : 'Submit application'}
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
