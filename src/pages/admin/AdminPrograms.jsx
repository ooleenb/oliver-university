import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import Icon from '../../components/Icon.jsx'
import { Card, PageHeader, Spinner, Alert } from '../../components/system/ui.jsx'

const empty = { code: '', name: '', level: 'Undergraduate', faculty: '', description: '', duration: '', tuition: '', capacity: 50 }
const inputCls = 'w-full rounded-lg border border-grey-200 px-4 py-2.5 outline-none focus:border-ink'

export default function AdminPrograms() {
  const [programs, setPrograms] = useState(null)
  const [msg, setMsg] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null) // null = 新建，否则为编辑中的专业 id
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function load() {
    api.programs.list().then((d) => setPrograms(d.programs)).catch(() => setPrograms([]))
  }
  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setForm(empty)
    setMsg(null)
    setShowForm(true)
  }

  function openEdit(p) {
    setEditingId(p.id)
    setForm({
      code: p.code,
      name: p.name,
      level: p.level,
      faculty: p.faculty,
      description: p.description || '',
      duration: p.duration || '',
      tuition: p.tuition ?? '',
      capacity: p.capacity ?? 50,
    })
    setMsg(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(empty)
  }

  async function submitForm(e) {
    e.preventDefault()
    setMsg(null)
    setBusy(true)
    try {
      const payload = {
        name: form.name,
        level: form.level,
        faculty: form.faculty,
        description: form.description,
        duration: form.duration,
        tuition: form.tuition ? Number(form.tuition) : null,
        capacity: Number(form.capacity) || 50,
      }
      if (editingId) {
        // code 不可改（作为唯一标识），故编辑时不提交
        await api.admin.updateProgram(editingId, payload)
        setMsg({ kind: 'success', text: `Updated ${form.name}` })
      } else {
        await api.admin.createProgram({ code: form.code, ...payload })
        setMsg({ kind: 'success', text: `Added ${form.name}` })
      }
      closeForm()
      load()
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  async function toggleOpen(p) {
    try {
      await api.admin.updateProgram(p.id, { is_open: p.is_open ? 0 : 1 })
      load()
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    }
  }

  async function deleteProgram(p) {
    if (!window.confirm(`Delete ${p.name} (${p.code})?\nIts course catalogue will be removed too. This cannot be undone.`)) return
    setMsg(null)
    try {
      await api.admin.deleteProgram(p.id)
      setMsg({ kind: 'success', text: `Deleted ${p.name}` })
      load()
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Curriculum"
        title="Programs"
        sub="Add, edit and manage the programs applicants can apply to."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Icon name="plus" size={18} /> New program
          </button>
        }
      />

      {msg && <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div>}

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink">{editingId ? 'Edit program' : 'New program'}</h2>
            <button onClick={closeForm} className="text-sm font-semibold text-grey-500 hover:text-ink">Cancel</button>
          </div>
          <form onSubmit={submitForm} className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">
                Code {editingId && <span className="font-normal text-grey-400">(cannot be changed)</span>}
              </span>
              <input value={form.code} onChange={set('code')} disabled={!!editingId} placeholder="Code (e.g. BCS)" className={`${inputCls} disabled:bg-grey-50 disabled:text-grey-400`} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Program name</span>
              <input value={form.name} onChange={set('name')} placeholder="Program name" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Level</span>
              <select value={form.level} onChange={set('level')} className={inputCls}>
                <option>Undergraduate</option>
                <option>Postgraduate</option>
                <option>Research</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Faculty</span>
              <input value={form.faculty} onChange={set('faculty')} placeholder="Faculty" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Duration</span>
              <input value={form.duration} onChange={set('duration')} placeholder="e.g. 3 years" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Tuition / year</span>
              <input value={form.tuition} onChange={set('tuition')} type="number" placeholder="e.g. 42000" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Capacity</span>
              <input value={form.capacity} onChange={set('capacity')} type="number" placeholder="50" className={inputCls} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-ink">Description</span>
              <textarea value={form.description} onChange={set('description')} placeholder="Short description" rows={2} className={inputCls} />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={busy} className="rounded-full bg-ink px-6 py-2.5 font-semibold text-white hover:bg-ink-700 transition-colors disabled:opacity-60">
                {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add program'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {programs === null ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.code} · {p.level}</span>
                  <h3 className="font-serif text-lg font-semibold text-ink leading-snug mt-0.5">{p.name}</h3>
                  <p className="text-sm text-grey-600 mt-1">{p.faculty}</p>
                </div>
                <button
                  onClick={() => toggleOpen(p)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    p.is_open ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-grey-100 text-grey-500 hover:bg-grey-200'
                  }`}
                >
                  {p.is_open ? 'Open' : 'Closed'}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-grey-100 pt-4">
                <button
                  onClick={() => openEdit(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-grey-200 px-3 py-1.5 text-sm font-semibold text-ink hover:border-ink transition-colors"
                >
                  <Icon name="edit" size={15} /> Edit
                </button>
                <button
                  onClick={() => deleteProgram(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Icon name="trash" size={15} /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
