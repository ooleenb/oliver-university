import { Link } from 'react-router-dom'
import { university } from '../../data/mock.js'
import Icon from '../Icon.jsx'

// 借鉴墨尔本 homepage-hero-banner：overline + 大标题 + 描述 + CTA + 背景图
export default function Hero() {
  return (
    <section
      className="relative text-white"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(10,31,68,0.92) 0%, rgba(10,31,68,0.65) 55%, rgba(10,31,68,0.25) 100%), url(/campus.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container-page py-24 md:py-36 max-w-3xl">
        <span className="eyebrow eyebrow--on-dark mb-6">{university.name}</span>
        <h1 className="display-serif text-5xl md:text-7xl mb-6">
          Seek Your Potential
        </h1>
        <p className="text-lg md:text-xl text-white/85 mb-9 max-w-xl leading-relaxed">
          Freedom of thinking, freedom of speech, freedom of expression.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/apply-now"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold hover:bg-primary-dark hover:gap-3 transition-all"
          >
            Apply now
            <Icon name="arrow" size={18} />
          </Link>
          <a
            href="#study"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white hover:bg-white hover:text-ink transition-colors"
          >
            Explore Oliver University
          </a>
        </div>
      </div>

      {/* 底部金色细线，呼应品牌点缀 */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
    </section>
  )
}
