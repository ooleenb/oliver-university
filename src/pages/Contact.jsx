import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../components/Icon.jsx'

const CHANNELS = [
  { icon: 'user', label: 'General enquiries', value: '+61 433 961 229', sub: 'Mon–Fri, 9am–5pm' },
  { icon: 'inbox', label: 'Email', value: 'ooleenb@gmail.com', sub: 'We reply within 2 business days' },
  { icon: 'pin', label: 'Campus', value: '1 University Avenue, Oliverton', sub: 'Visitor parking available' },
]

export default function Contact() {
  const location = useLocation()
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  function onSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  const inputCls = 'w-full rounded-lg border border-grey-200 px-4 py-2.5 outline-none focus:border-ink transition-colors'

  return (
    <>
      {/* 横幅 */}
      <section className="bg-ink text-white">
        <div className="container-page py-16 md:py-20 max-w-3xl">
          <span className="eyebrow eyebrow--on-dark mb-5">Get in touch</span>
          <h1 className="display-serif text-4xl md:text-5xl mb-4">Contact us</h1>
          <p className="text-white/80 max-w-xl">
            Have a question about studying, research or working with Oliver University? We’d love to hear from you.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page section-y grid gap-12 lg:grid-cols-2">
          {/* 联系方式 */}
          <div>
            <span className="eyebrow mb-4">Ways to reach us</span>
            <h2 className="display-serif text-3xl text-ink mb-8">We’re here to help</h2>
            <ul className="space-y-5">
              {CHANNELS.map((c) => (
                <li key={c.label} className="flex items-start gap-4">
                  <span className="grid place-items-center w-12 h-12 rounded-xl bg-sand text-primary shrink-0">
                    <Icon name={c.icon} size={22} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-grey-500">{c.label}</p>
                    <p className="font-serif text-lg font-semibold text-ink">{c.value}</p>
                    <p className="text-sm text-grey-600">{c.sub}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* 紧急 */}
            <div id="emergency" className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 scroll-mt-24">
              <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-red-700 mb-1">
                <Icon name="shield" size={20} /> Emergency &amp; security
              </h3>
              <p className="text-sm text-red-700/90">
                For on-campus emergencies, call campus security on <strong>+61 433 000 000</strong> (24/7), or dial
                <strong> 000</strong> for police, fire or ambulance.
              </p>
            </div>
          </div>

          {/* 表单 */}
          <div>
            <div className="rounded-2xl border border-grey-200 bg-grey-50 p-6 md:p-8">
              <h2 className="font-serif text-xl font-semibold text-ink mb-5">Send us a message</h2>
              {sent ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <span className="grid place-items-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto mb-3">
                    <Icon name="check" size={24} />
                  </span>
                  <p className="font-serif text-lg font-semibold text-ink">Thanks for reaching out</p>
                  <p className="text-sm text-grey-600 mt-1">
                    We’ve received your message and will get back to you within two business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="grid gap-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-ink">Full name</span>
                    <input required placeholder="Your name" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-ink">Email</span>
                    <input required type="email" placeholder="you@example.com" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-ink">How can we help?</span>
                    <textarea required rows={4} placeholder="Your message" className={inputCls} />
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark transition-colors"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
