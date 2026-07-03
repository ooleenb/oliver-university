import { Link } from 'react-router-dom'
import { useAuth, HOME_BY_ROLE } from '../auth.jsx'
import Icon from '../components/Icon.jsx'

const STEPS = [
  {
    title: 'Create your account',
    desc: 'Register in under a minute with your name and email. Your account keeps every application and offer in one place.',
    icon: 'user',
  },
  {
    title: 'Choose your program',
    desc: 'Browse undergraduate, postgraduate and research programs across ten faculties, and start an application in one click.',
    icon: 'compass',
  },
  {
    title: 'Complete and upload',
    desc: 'Fill in your personal and academic details, write your statement, and upload transcripts and supporting documents.',
    icon: 'upload',
  },
  {
    title: 'Submit and track',
    desc: 'Submit your application, respond to any requests for information, and accept your offer online when it arrives.',
    icon: 'check',
  },
]

const FACTS = [
  { label: 'Applications for', value: 'Semester 1, 2027', hint: 'Now open' },
  { label: 'Application fee', value: 'No fee', hint: 'Free to apply' },
  { label: 'Decision time', value: '2–4 weeks', hint: 'From submission' },
]

export default function ApplyNow() {
  const { user } = useAuth()

  return (
    <>
      {/* 顶部横幅 */}
      <section
        className="relative text-white"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(10,31,68,0.94) 0%, rgba(10,31,68,0.7) 60%, rgba(10,31,68,0.35) 100%), url(/campus.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container-page py-20 md:py-28 max-w-3xl">
          <span className="eyebrow eyebrow--on-dark mb-5">Admissions</span>
          <h1 className="display-serif text-4xl md:text-6xl mb-5">Apply to Oliver University</h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 max-w-xl leading-relaxed">
            Start your journey in four simple steps. Create an account, choose a program, and track your offer — all online.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {user ? (
              <Link
                to={HOME_BY_ROLE[user.role] || '/apply'}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold hover:bg-primary-dark hover:gap-3 transition-all"
              >
                Continue your application <Icon name="arrow" size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold hover:bg-primary-dark hover:gap-3 transition-all"
                >
                  Create your account <Icon name="arrow" size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white hover:bg-white hover:text-ink transition-colors"
                >
                  Sign in to continue
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
      </section>

      {/* 关键信息条 */}
      <section className="bg-sand">
        <div className="container-page py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FACTS.map((f) => (
            <div key={f.label} className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{f.label}</p>
              <p className="font-serif text-2xl font-semibold text-ink mt-1">{f.value}</p>
              <p className="text-sm text-grey-600">{f.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 申请步骤 */}
      <section className="bg-white">
        <div className="container-page section-y">
          <span className="eyebrow mb-4">How to apply</span>
          <h2 className="display-serif text-3xl md:text-4xl mb-10">Four steps to your place</h2>

          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-grey-200 bg-white p-6 card-lift">
                <span className="font-serif text-4xl font-semibold text-gold/70 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-sand text-primary my-4">
                  <Icon name={s.icon} size={22} />
                </span>
                <h3 className="font-serif text-lg font-semibold text-ink mb-1.5">{s.title}</h3>
                <p className="text-sm text-grey-600 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 底部行动号召 */}
      <section className="bg-ink text-white">
        <div className="container-page py-16 text-center">
          <span className="eyebrow eyebrow--center eyebrow--on-dark mb-5">Ready when you are</span>
          <h2 className="display-serif text-3xl md:text-4xl mb-4">Begin your application today</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            It's free to apply and takes just a few minutes to get started. Your future begins with a single step.
          </p>
          {user ? (
            <Link
              to={HOME_BY_ROLE[user.role] || '/apply'}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold hover:bg-primary-dark transition-colors"
            >
              Go to your portal <Icon name="arrow" size={18} />
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold hover:bg-primary-dark transition-colors"
            >
              Create your account <Icon name="arrow" size={18} />
            </Link>
          )}
        </div>
      </section>
    </>
  )
}
