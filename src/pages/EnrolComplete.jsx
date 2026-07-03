import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { api } from '../lib/api.js'
import { university } from '../data/mock.js'
import Icon from '../components/Icon.jsx'
import Crest from '../components/Crest.jsx'

// 录取转学生后的落地页：展示学号/学生邮箱，并当场设置密码 → 返回登录页
export default function EnrolComplete() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // 优先用接受 offer 时传入的 student，退回当前登录用户
  const student = location.state?.student || {}
  const studentNo = student.studentNo || user?.studentNo || ''
  const studentEmail = student.email || user?.email || ''
  const name = student.name || user?.name || 'there'

  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    if (pwd.length < 6) return setErr('Password must be at least 6 characters')
    if (pwd !== confirm) return setErr('The two passwords do not match')
    setBusy(true)
    try {
      await api.auth.setPassword(pwd)
      // 设密码成功 → 退出登录，回到登录页用新学生账号登录
      logout()
      navigate('/login', { replace: true, state: { justEnrolled: true, email: studentEmail } })
    } catch (e) {
      setErr(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-grey-50 p-6">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-ink">
          <Crest size={40} />
          <span className="font-serif text-lg font-semibold">{university.name}</span>
        </Link>

        <div className="rounded-2xl border border-grey-200 bg-white p-8 shadow-sm">
          {/* 欢迎语 */}
          <div className="mb-6 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Icon name="check" size={30} />
            </span>
            <h1 className="display-serif text-3xl text-ink">Welcome, {name}!</h1>
            <p className="mt-1.5 text-grey-600">
              Your offer is accepted and you are now a student of Oliver University.
            </p>
          </div>

          {/* 学生账号信息 */}
          <div className="mb-6 rounded-xl border border-grey-200 bg-grey-50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-grey-500">
              Your student account
            </p>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-grey-600">Student number</dt>
                <dd className="font-mono font-semibold text-ink">{studentNo}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-grey-600">Login email</dt>
                <dd className="font-mono font-semibold text-ink break-all text-right">{studentEmail}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-grey-500">
              Please note down your student number — you will use the email above to sign in.
            </p>
          </div>

          {/* 设置密码 */}
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm font-semibold text-ink">Set a password for your student account</p>
            <label className="block">
              <span className="mb-1.5 block text-sm text-grey-600">New password</span>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full rounded-lg border border-grey-200 bg-white px-4 py-3 outline-none focus:border-ink transition-colors"
                placeholder="At least 6 characters"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-grey-600">Confirm password</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-grey-200 bg-white px-4 py-3 outline-none focus:border-ink transition-colors"
                placeholder="Re-enter your password"
              />
            </label>

            {err && <p className="text-sm text-primary">{err}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary py-3.5 font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Set password & continue to login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
