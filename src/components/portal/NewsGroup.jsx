import { Link } from 'react-router-dom'
import { news, events } from '../../data/mock.js'
import Icon from '../Icon.jsx'

function NewsCard({ item }) {
  return (
    <Link
      to={`/news/${item.id}`}
      className="card-lift group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-grey-200"
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={item.img}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm">
          {item.tag}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif font-semibold text-ink leading-snug text-lg group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="mt-2.5 text-sm text-grey-600 line-clamp-3">{item.desc}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/80 group-hover:text-primary group-hover:gap-2.5 transition-all">
          Read more <Icon name="arrow" size={15} />
        </span>
      </div>
    </Link>
  )
}

export default function NewsGroup() {
  return (
    <section id="news" className="bg-grey-50">
      <div className="container-page section-y">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="eyebrow mb-4">Newsroom</span>
            <h2 className="display-serif text-3xl md:text-[2.75rem]">News &amp; Opinions</h2>
            <p className="text-grey-600 mt-3 max-w-xl">Read the latest news and independent opinions from Oliver University</p>
          </div>
          <Link to="/news" className="hidden sm:inline-flex items-center gap-1.5 font-semibold text-primary link-underline">
            View all <Icon name="arrow" size={16} />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <NewsCard key={n.title} item={n} />
          ))}
        </div>

        {/* 活动列表（借鉴墨尔本 event list） */}
        <div className="mt-20 mb-8">
          <span className="eyebrow mb-4">What's on</span>
          <h2 className="display-serif text-3xl md:text-4xl">Upcoming Events</h2>
        </div>
        <ul className="divide-y divide-grey-200 rounded-2xl border border-grey-200 bg-white overflow-hidden">
          {events.map((e) => (
            <li key={e.title}>
              <Link to="/news#events" className="group flex items-center gap-5 p-5 hover:bg-sand transition-colors">
                <span className="grid place-items-center w-14 h-14 rounded-xl bg-sand text-primary shrink-0 group-hover:bg-ink group-hover:text-gold transition-colors">
                  <Icon name="calendar" size={24} />
                </span>
                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">{e.date} · {e.type}</span>
                  <span className="block font-serif text-lg font-semibold text-ink mt-0.5">{e.title}</span>
                </div>
                <Icon name="arrow" size={18} className="text-grey-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
