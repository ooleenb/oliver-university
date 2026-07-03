import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import { studyAreas, studyLevels } from '../../data/mock.js'

// 借鉴悉尼 course-finder 的图标网格 + 学习层次列表
export default function StudyAreas() {
  return (
    <section className="bg-white">
      <div className="container-page section-y">
        {/* 学科领域网格 */}
        <span className="eyebrow mb-4">Ten faculties</span>
        <h2 className="display-serif text-3xl md:text-4xl mb-8">Choose a Study Area</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {studyAreas.map((a) => (
            <li key={a.title}>
              <Link
                to={`/courses?q=${encodeURIComponent(a.q)}`}
                className="group relative flex items-center gap-3 rounded-xl border border-grey-200 p-4 hover:border-ink hover:shadow-md transition-all h-full"
              >
                <span className="grid place-items-center w-10 h-10 rounded-lg bg-sand text-primary shrink-0 group-hover:bg-ink group-hover:text-gold transition-colors">
                  <Icon name={a.icon} size={22} />
                </span>
                <span className="text-sm font-semibold text-ink leading-tight">{a.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 学习层次 */}
        <span className="eyebrow mt-20 mb-4">Your pathway</span>
        <h2 className="display-serif text-3xl md:text-4xl mb-8">Study Levels</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyLevels.map((l, i) => (
            <li key={l.title}>
              <Link
                to={l.level ? `/courses?level=${encodeURIComponent(l.level)}` : '/courses'}
                className="group flex items-start gap-5 rounded-2xl border border-grey-200 bg-grey-50 p-6 hover:bg-sand hover:border-ink/20 transition-all h-full"
              >
                <span className="font-serif text-3xl font-semibold text-gold/70 leading-none shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-serif text-lg font-semibold text-ink group-hover:text-primary transition-colors">
                    {l.title}
                    <Icon name="arrow" size={16} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </span>
                  <span className="block text-sm text-grey-600 mt-1">{l.desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
