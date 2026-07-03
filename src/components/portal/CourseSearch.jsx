import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../Icon.jsx'

// 借鉴墨尔本/悉尼的 course-finder 搜索框
export default function CourseSearch() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    navigate(q.trim() ? `/courses?q=${encodeURIComponent(q.trim())}` : '/courses')
  }

  return (
    <section id="study" className="bg-sand">
      <div className="container-page section-y text-center">
        <span className="eyebrow eyebrow--center mb-5">Study at Oliver University</span>
        <h2 className="display-serif text-4xl md:text-5xl mb-4 max-w-2xl mx-auto">
          Find a course
        </h2>
        <p className="text-grey-600 mb-8 max-w-lg mx-auto">
          Explore over 400 undergraduate and postgraduate degrees across ten faculties.
        </p>
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Icon
              name="search"
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a course or unit"
              className="w-full rounded-full border border-grey-200 bg-white pl-12 pr-4 py-4 text-ink outline-none focus:border-ink transition-colors"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-ink px-8 py-4 font-semibold text-white hover:bg-ink-700 transition-colors"
          >
            Search
          </button>
        </form>
        <Link
          to="/courses"
          className="mt-6 inline-flex items-center gap-1.5 font-semibold text-primary link-underline"
        >
          Or browse all courses <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  )
}
