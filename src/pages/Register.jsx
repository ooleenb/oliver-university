import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { university } from '../data/mock.js'
import Crest from '../components/Crest.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await register(form)
      navigate('/apply', { replace: true })
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white"
        style={{
          backgroundImage:
            'linear-gradient(160deg, rgba(10,31,68,0.95), rgba(141,14,35,0.85)), url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=70)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Link to="/" className="flex items-center gap-3">
          <Crest size={48} tone="onDark" />
          <span className="font-serif text-xl font-semibold">{university.name}</span>
        </Link>
        <div>
          <h1 className="display-serif text-4xl mb-4">Start your application</h1>
          <p className="text-white/80 max-w-sm">
            Create an account to apply for undergraduate, postgraduate and research programs, upload your documents and track every decision in one place.
          </p>
        </div>
        <p className="text-xs text-white/50">© 2026 {university.name} · Practice Project</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-grey-50">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 text-ink">
            <Crest size={38} />
            <span className="font-serif font-semibold">{university.name}</span>
          </Link>

          <h2 className="font-serif text-3xl font-semibold text-ink mb-2">Create your account</h2>
          <p className="text-grey-600 mb-8">Join as an applicant — it only takes a minute</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm font-semibold text-ink mb-1.5">First name</span>
                <input
                  value={form.firstName}
                  onChange={set('firstName')}
                  className="w-full rounded-lg border border-grey-200 bg-white px-4 py-3 outline-none focus:border-ink transition-colors"
                  placeholder="First name"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-ink mb-1.5">Last name</span>
                <input
                  value={form.lastName}
                  onChange={set('lastName')}
                  className="w-full rounded-lg border border-grey-200 bg-white px-4 py-3 outline-none focus:border-ink transition-colors"
                  placeholder="Last name"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-ink mb-1.5">
                Middle name <span className="font-normal text-grey-400">(optional)</span>
              </span>
              <input
                value={form.middleName}
                onChange={set('middleName')}
                className="w-full rounded-lg border border-grey-200 bg-white px-4 py-3 outline-none focus:border-ink transition-colors"
                placeholder="Middle name"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-ink mb-1.5">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                className="w-full rounded-lg border border-grey-200 bg-white px-4 py-3 outline-none focus:border-ink transition-colors"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-ink mb-1.5">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                className="w-full rounded-lg border border-grey-200 bg-white px-4 py-3 outline-none focus:border-ink transition-colors"
                placeholder="At least 6 characters"
              />
            </label>

            {err && <p className="text-sm text-primary">{err}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary py-3.5 font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-grey-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
