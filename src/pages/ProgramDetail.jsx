import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../auth.jsx'
import Icon from '../components/Icon.jsx'

// 公开的专业详情页
export default function ProgramDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [program, setProgram] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setProgram(null)
    setError('')
    api.programs
      .get(id)
      .then((d) => setProgram(d.program))
      .catch((e) => setError(e.message))
  }, [id])

  const applyHref = user && (user.role === 'applicant' || user.role === 'student') ? '/apply/programs' : '/apply-now'

  if (error) {
    return (
      <section className="bg-white">
        <div className="container-page section-y text-center">
          <h1 className="display-serif text-3xl text-ink mb-3">Program not found</h1>
          <p className="text-grey-600 mb-6">{error}</p>
          <Link to="/courses" className="inline-flex items-center gap-2 font-semibold text-primary link-underline">
            <Icon name="arrow" size={16} className="rotate-180" /> Back to course finder
          </Link>
        </div>
      </section>
    )
  }

  if (!program) {
    return <div className="container-page section-y text-center text-grey-500 animate-pulse">Loading…</div>
  }

  const facts = [
    { label: 'Faculty', value: program.faculty, icon: 'building' },
    { label: 'Level', value: program.level, icon: 'grades' },
    { label: 'Duration', value: program.duration || '—', icon: 'clock' },
    {
      label: 'Tuition / year',
      value: program.tuition != null ? `$${program.tuition.toLocaleString()}` : '—',
      icon: 'chart',
    },
  ]

  return (
    <>
      {/* 顶部横幅 */}
      <section
        className="relative text-white"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(10,31,68,0.94) 0%, rgba(10,31,68,0.72) 60%, rgba(10,31,68,0.4) 100%), url(/campus.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container-page py-16 md:py-24 max-w-3xl">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors mb-6"
          >
            <Icon name="arrow" size={15} className="rotate-180" /> All courses
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {program.code}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{program.level}</span>
          </div>
          <h1 className="display-serif text-4xl md:text-6xl mb-5">{program.name}</h1>
          <p className="text-lg text-white/85 max-w-xl leading-relaxed">{program.description}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
      </section>

      {/* 关键信息 */}
      <section className="bg-sand">
        <div className="container-page py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {facts.map((f) => (
            <div key={f.label}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Icon name={f.icon} size={14} /> {f.label}
              </span>
              <p className="font-serif text-xl font-semibold text-ink mt-1.5 leading-tight">{f.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 详情正文 */}
      <section className="bg-white">
        <div className="container-page section-y grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="eyebrow mb-4">About this program</span>
            <h2 className="display-serif text-3xl text-ink mb-5">What you’ll study</h2>
            <div className="space-y-4 text-grey-700 leading-relaxed">
              <p>{program.description}</p>
              <p>
                The {program.name} is delivered by the {program.faculty} faculty over {program.duration || 'a flexible period'}.
                You’ll learn from experienced academics, work on real-world projects, and graduate ready to make an impact
                in your field.
              </p>
              <p>
                Throughout your studies you’ll build both the theoretical foundations and the practical skills employers
                value, supported by a community of curious, ambitious peers.
              </p>
            </div>
          </div>

          {/* 侧栏 CTA */}
          <aside>
            <div className="rounded-2xl border border-grey-200 bg-grey-50 p-6 sticky top-6">
              <h3 className="font-serif text-lg font-semibold text-ink mb-1">Start your application</h3>
              <p className="text-sm text-grey-600 mb-5">Free to apply · Decision in 2–4 weeks</p>
              <Link
                to={applyHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark transition-colors"
              >
                Apply now <Icon name="arrow" size={16} />
              </Link>
              <Link
                to="/courses"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-grey-200 px-6 py-3 font-semibold text-ink hover:border-ink transition-colors"
              >
                Compare other courses
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
