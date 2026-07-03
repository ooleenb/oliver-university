import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { news, events } from '../data/mock.js'
import Icon from '../components/Icon.jsx'

export default function News() {
  const location = useLocation()

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
      <section className="bg-ink text-white">
        <div className="container-page py-16 md:py-20 max-w-3xl">
          <span className="eyebrow eyebrow--on-dark mb-5">Newsroom</span>
          <h1 className="display-serif text-4xl md:text-5xl mb-4">News &amp; Events</h1>
          <p className="text-white/80 max-w-xl">
            The latest stories, discoveries and happenings from across Oliver University.
          </p>
        </div>
      </section>

      {/* 新闻网格 */}
      <section className="bg-white">
        <div className="container-page section-y">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <Link
                key={n.id}
                to={`/news/${n.id}`}
                className="card-lift group flex flex-col overflow-hidden rounded-2xl bg-white border border-grey-200"
              >
                <div className="relative overflow-hidden aspect-[16/9]">
                  <img
                    src={n.img}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm">
                    {n.tag}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs text-grey-500 mb-1.5">{n.date}</span>
                  <h3 className="font-serif font-semibold text-ink leading-snug text-lg group-hover:text-primary transition-colors">
                    {n.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-grey-600 line-clamp-3 flex-1">{n.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/80 group-hover:text-primary group-hover:gap-2.5 transition-all">
                    Read more <Icon name="arrow" size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 活动 */}
          <div id="events" className="mt-20 mb-8 scroll-mt-24">
            <span className="eyebrow mb-4">What’s on</span>
            <h2 className="display-serif text-3xl md:text-4xl">Upcoming Events</h2>
          </div>
          <ul className="divide-y divide-grey-200 rounded-2xl border border-grey-200 bg-white overflow-hidden">
            {events.map((e) => (
              <li key={e.title} className="group flex items-center gap-5 p-5 hover:bg-sand transition-colors">
                <span className="grid place-items-center w-14 h-14 rounded-xl bg-sand text-primary shrink-0 group-hover:bg-ink group-hover:text-gold transition-colors">
                  <Icon name="calendar" size={24} />
                </span>
                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {e.date} · {e.type}
                  </span>
                  <span className="block font-serif text-lg font-semibold text-ink mt-0.5">{e.title}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
