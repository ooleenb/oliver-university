import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { news } from '../data/mock.js'
import Icon from '../components/Icon.jsx'

export default function NewsArticle() {
  const { id } = useParams()
  const article = news.find((n) => n.id === id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!article) {
    return (
      <section className="bg-white">
        <div className="container-page section-y text-center">
          <h1 className="display-serif text-3xl text-ink mb-3">Article not found</h1>
          <Link to="/news" className="inline-flex items-center gap-2 font-semibold text-primary link-underline">
            <Icon name="arrow" size={16} className="rotate-180" /> Back to newsroom
          </Link>
        </div>
      </section>
    )
  }

  const related = news.filter((n) => n.id !== article.id).slice(0, 2)

  return (
    <article className="bg-white">
      {/* 头图 */}
      <div className="relative aspect-[21/9] max-h-[420px] overflow-hidden">
        <img src={article.img} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
      </div>

      <div className="container-page section-y max-w-3xl">
        <Link
          to="/news"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-grey-500 hover:text-ink transition-colors mb-6"
        >
          <Icon name="arrow" size={15} className="rotate-180" /> Newsroom
        </Link>

        <span className="rounded-full bg-sand px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
          {article.tag}
        </span>
        <h1 className="display-serif text-3xl md:text-5xl text-ink mt-4 mb-4">{article.title}</h1>
        <p className="text-sm text-grey-500 mb-8">
          {article.date} · By {article.author}
        </p>

        <div className="space-y-5 text-lg text-grey-700 leading-relaxed">
          {article.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      {/* 相关文章 */}
      {related.length > 0 && (
        <section className="bg-grey-50">
          <div className="container-page section-y">
            <h2 className="display-serif text-2xl text-ink mb-6">More news</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {related.map((n) => (
                <Link
                  key={n.id}
                  to={`/news/${n.id}`}
                  className="card-lift group flex gap-4 rounded-2xl border border-grey-200 bg-white p-4"
                >
                  <img src={n.img} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">{n.tag}</span>
                    <h3 className="font-serif font-semibold text-ink leading-snug mt-1 group-hover:text-primary transition-colors">
                      {n.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
