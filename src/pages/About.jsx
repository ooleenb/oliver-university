import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { university, stats } from '../data/mock.js'
import Icon from '../components/Icon.jsx'

const SECTIONS = [
  {
    id: 'research',
    eyebrow: 'Research',
    title: 'Research that changes the world',
    body: [
      'Our researchers tackle the questions that matter most — from climate and health to justice, technology and the arts. Across ten faculties, teams work side by side with industry, government and communities to turn discovery into impact.',
      'With world-class facilities and a culture of curiosity, Oliver University consistently ranks among the nation’s leading research institutions.',
    ],
    icon: 'bulb',
  },
  {
    id: 'engage',
    eyebrow: 'Engage',
    title: 'Partner with us',
    body: [
      'We believe education and research are strongest when shared. Through industry partnerships, community programs and public events, we connect our people and ideas with the wider world.',
      'Whether you’re an employer, alumnus, or curious neighbour, there are many ways to get involved with Oliver University.',
    ],
    icon: 'handshake',
  },
  {
    id: 'give',
    eyebrow: 'Give',
    title: 'Support the next generation',
    body: [
      'Philanthropy shapes everything we do — from scholarships that open doors, to research that saves lives. Every gift, large or small, helps a student seek their potential.',
      'Get in touch with our advancement team to learn how your support can make a lasting difference.',
    ],
    icon: 'heart',
  },
  {
    id: 'library',
    eyebrow: 'Library',
    title: 'A home for ideas',
    body: [
      'Our libraries hold millions of volumes, rich digital collections and quiet spaces to think. Open extended hours during term, they are the intellectual heart of campus.',
      'Students and staff enjoy access to databases, study rooms, and expert librarians ready to help with any research question.',
    ],
    icon: 'book',
  },
]

export default function About() {
  const location = useLocation()

  // 支持 /about#research 等锚点跳转
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  return (
    <>
      {/* 横幅 */}
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
          <span className="eyebrow eyebrow--on-dark mb-5">About us</span>
          <h1 className="display-serif text-4xl md:text-6xl mb-5">A community of free thinkers</h1>
          <p className="text-lg md:text-xl text-white/85 max-w-xl leading-relaxed">
            Founded in 2014, {university.name} is a hub for ideas and a home for free thinking.
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
      </section>

      {/* 统计 */}
      <section className="bg-sand">
        <div className="container-page py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.text} className="text-center">
              <p className="display-serif text-5xl text-primary mb-2">{s.value}</p>
              <p className="text-sm text-grey-600 max-w-[16rem] mx-auto">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 各主题区块 */}
      {SECTIONS.map((sec, i) => (
        <section key={sec.id} id={sec.id} className={i % 2 === 0 ? 'bg-white' : 'bg-grey-50'}>
          <div className="container-page section-y grid gap-8 md:grid-cols-3 items-start scroll-mt-24">
            <div>
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-sand text-primary mb-4">
                <Icon name={sec.icon} size={28} />
              </span>
              <span className="eyebrow mb-3">{sec.eyebrow}</span>
              <h2 className="display-serif text-3xl text-ink">{sec.title}</h2>
            </div>
            <div className="md:col-span-2 space-y-4 text-grey-700 leading-relaxed md:pt-2">
              {sec.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-ink text-white">
        <div className="container-page py-16 text-center">
          <h2 className="display-serif text-3xl md:text-4xl mb-4">Come and study with us</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            Explore our courses and start your application today — it’s free and takes just a few minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold hover:bg-primary-dark transition-colors"
            >
              Explore courses <Icon name="arrow" size={18} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white hover:bg-white hover:text-ink transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
