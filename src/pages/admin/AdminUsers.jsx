import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../auth.jsx'
import Icon from '../../components/Icon.jsx'
import { Card, PageHeader, Spinner, Alert } from '../../components/system/ui.jsx'

const ROLES = ['applicant', 'student', 'admissions', 'admin']
const ROLE_CLS = {
  applicant: 'bg-blue-50 text-blue-700',
  student: 'bg-emerald-50 text-emerald-700',
  admissions: 'bg-amber-50 text-amber-700',
  admin: 'bg-primary/10 text-primary',
}

const EMPTY = { name: '', email: '', password: '', role: 'admissions', studentNo: '' }

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState(null)
  const [roleFilter, setRoleFilter] = useState('')
  const [msg, setMsg] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null) // null = 新建，否则为编辑中的用户 id
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function load() {
    const qs = roleFilter ? `?role=${roleFilter}` : ''
    api.admin.users(qs).then((d) => setUsers(d.users)).catch(() => setUsers([]))
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY)
    setMsg(null)
    setShowForm(true)
  }

  function openEdit(u) {
    setEditingId(u.id)
    setForm({ name: u.name || '', email: u.email || '', password: '', role: u.role, studentNo: u.student_no || '' })
    setMsg(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY)
  }

  async function submitForm(e) {
    e.preventDefault()
    setMsg(null)
    setBusy(true)
    try {
      if (editingId) {
        // 编辑：只发送带值的字段，密码留空则不改
        const body = {
          name: form.name,
          email: form.email,
          role: form.role,
          studentNo: form.studentNo,
        }
        if (form.password) body.password = form.password
        await api.admin.updateUser(editingId, body)
        setMsg({ kind: 'success', text: `Updated ${form.name}` })
      } else {
        await api.admin.createUser({ name: form.name, email: form.email, password: form.password, role: form.role })
        setMsg({ kind: 'success', text: `Created ${form.name}` })
      }
      closeForm()
      load()
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  async function deleteUser(u) {
    if (!window.confirm(`Delete ${u.name} (${u.email})?\nThis will also remove their applications, offers and enrolments. This cannot be undone.`)) {
      return
    }
    setMsg(null)
    try {
      await api.admin.deleteUser(u.id)
      setMsg({ kind: 'success', text: `Deleted ${u.name}` })
      load()
    } catch (e) {
      setMsg({ kind: 'error', text: e.message })
    }
  }

  const inputCls = 'rounded-lg border border-grey-200 px-4 py-2.5 outline-none focus:border-ink'

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="People"
        title="Users"
        sub="Manage accounts, roles and credentials across the university."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Icon name="plus" size={18} /> New staff account
          </button>
        }
      />

      {msg && <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div>}

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink">
              {editingId ? 'Edit account' : 'Create account'}
            </h2>
            <button onClick={closeForm} className="text-sm font-semibold text-grey-500 hover:text-ink">Cancel</button>
          </div>
          <form onSubmit={submitForm} className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Full name</span>
              <input value={form.name} onChange={set('name')} placeholder="Full name" className={`w-full ${inputCls}`} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Email</span>
              <input type="email" value={form.email} onChange={set('email')} placeholder="Email" className={`w-full ${inputCls}`} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">
                Password {editingId && <span className="font-normal text-grey-400">(leave blank to keep)</span>}
              </span>
              <input type="password" value={form.password} onChange={set('password')} placeholder={editingId ? '••••••' : 'Temporary password'} className={`w-full ${inputCls}`} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Role</span>
              <select value={form.role} onChange={set('role')} className={`w-full ${inputCls} capitalize`}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            {editingId && (
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink">Student number <span className="font-normal text-grey-400">(optional)</span></span>
                <input value={form.studentNo} onChange={set('studentNo')} placeholder="e.g. 100001" className={`w-full ${inputCls}`} />
              </label>
            )}
            <div className="sm:col-span-2">
              <button type="submit" disabled={busy} className="rounded-full bg-ink px-6 py-2.5 font-semibold text-white hover:bg-ink-700 transition-colors disabled:opacity-60">
                {busy ? 'Saving…' : editingId ? 'Save changes' : 'Create account'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {['', ...ROLES].map((r) => (
          <button
            key={r || 'all'}
            onClick={() => setRoleFilter(r)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              roleFilter === r ? 'bg-ink text-white' : 'bg-white border border-grey-200 text-ink hover:border-ink'
            }`}
          >
            {r || 'All'}
          </button>
        ))}
      </div>

      {users === null ? (
        <Spinner />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-grey-500 border-b border-grey-100">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold hidden sm:table-cell">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-grey-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink">
                      {u.name}
                      {u.id === me?.id && <span className="ml-2 text-xs font-normal text-grey-400">(you)</span>}
                    </p>
                    {u.student_no && <p className="text-xs text-grey-500">{u.student_no}</p>}
                  </td>
                  <td className="px-5 py-3 text-grey-600 hidden sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ROLE_CLS[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-grey-200 px-3 py-1.5 text-sm font-semibold text-ink hover:border-ink transition-colors"
                      >
                        <Icon name="edit" size={15} /> Edit
                      </button>
                      <button
                        onClick={() => deleteUser(u)}
                        disabled={u.id === me?.id}
                        title={u.id === me?.id ? 'You cannot delete your own account' : 'Delete user'}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <Icon name="trash" size={15} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
