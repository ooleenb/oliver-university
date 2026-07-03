import { stats } from '../../data/mock.js'
import Icon from '../Icon.jsx'

// 借鉴墨尔本 stats-and-rankings：深色背景 + 大数字
export default function Stats() {
  return (
    <section id="about" className="bg-ink text-white">
      <div className="container-page section-y text-center">
        <span className="eyebrow eyebrow--center eyebrow--on-dark mb-5">By the numbers</span>
        <h2 className="display-serif text-3xl md:text-5xl mb-14">
          Our Reputation in the World
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 md:divide-x md:divide-white/10">
          {stats.map((s) => (
            <div key={s.text} className="flex flex-col items-center px-4">
              <span className="font-serif text-6xl md:text-8xl font-semibold text-gold tracking-tight">{s.value}</span>
              <span className="mt-4 text-white/75 max-w-[16rem] leading-relaxed">{s.text}</span>
            </div>
          ))}
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2 mt-14 rounded-full border border-white/40 px-7 py-3.5 font-semibold hover:bg-white hover:text-ink hover:gap-3 transition-all"
        >
          Explore our global rankings
          <Icon name="arrow" size={18} />
        </a>
      </div>
    </section>
  )
}
