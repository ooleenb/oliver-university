import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, HOME_BY_ROLE } from '../auth.jsx'
import { university } from '../data/mock.js'
import Icon from '../components/Icon.jsx'
import Crest from '../components/Crest.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // 刚完成录取设密码 → 预填学生邮箱并给出成功提示
  const justEnrolled = location.state?.justEnrolled
  const [email, setEmail] = useState(justEnrolled ? location.state?.email || '' : '')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    if (!email.trim() || !pwd.trim()) {
      setErr('Please enter your email and password')
      return
    }
    setBusy(true)
    try {
      const user = await login(email.trim(), pwd)
      // /enrol 只是录取后一次性的设密码流程，绝不能作为登录落地页（否则会被送回设密码界面）
      const from = location.state?.from?.pathname
      const target = from && from !== '/enrol' ? from : HOME_BY_ROLE[user.role] || '/'
      navigate(target, { replace: true })
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* 左侧品牌区 */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white"
        style={{
          backgroundImage:
            'linear-gradient(160deg, rgba(10,31,68,0.95), rgba(141,14,35,0.85)), url(https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=70)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Link to="/" className="flex items-center gap-3">
          <Crest size={48} tone="onDark" />
          <span className="font-serif text-xl font-semibold">{university.name}</span>
        </Link>
        <div>
          <h1 className="display-serif text-4xl mb-4">One portal, every journey</h1>
          <p className="text-white/80 max-w-sm">
            Apply for a place, track your offer, or manage your studies. A network of free thoughts — become your better self.
          </p>
        </div>
        <p className="text-xs text-white/50">© 2026 {university.name} · Practice Project</p>
      </div>

      {/* 右侧表单区 */}
      <div className="flex items-center justify-center p-6 bg-grey-50">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 text-ink">
            <Crest size={38} />
            <span className="font-serif font-semibold">{university.name}</span>
          </Link>

          <h2 className="font-serif text-3xl font-semibold text-ink mb-2">Welcome back</h2>
          <p className="text-grey-600 mb-8">Sign in to your Oliver University account</p>

          {justEnrolled && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Your password has been set. Sign in with your student email to enter the portal.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-semibold text-ink mb-1.5">Email</span>
              <div className="relative">
                <Icon name="user" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-grey-200 bg-white pl-11 pr-4 py-3 outline-none focus:border-ink transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-ink mb-1.5">Password</span>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full rounded-lg border border-grey-200 bg-white px-4 py-3 outline-none focus:border-ink transition-colors"
                placeholder="Your password"
              />
            </label>

            {err && <p className="text-sm text-primary">{err}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary py-3.5 font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-sm text-grey-600">
            New here?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create an applicant account
            </Link>
          </p>

          <p className="mt-6 text-sm text-grey-600">
            <Link to="/" className="text-primary font-semibold hover:underline">← Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
