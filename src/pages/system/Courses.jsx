import { useEffect, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { Spinner, Alert } from '../../components/system/ui.jsx'
import { api } from '../../lib/api.js'

export default function Courses() {
  const [courses, setCourses] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.student.courses().then((d) => setCourses(d.courses)).catch((e) => setError(e.message))
  }, [])

  if (error) return <Alert>{error}</Alert>
  if (!courses) return <Spinner />

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-1">My Courses</h1>
      <p className="text-grey-600 mb-6">{courses.length} courses this semester</p>

      {courses.length === 0 ? (
        <div className="rounded-2xl bg-white border border-grey-200 p-10 text-center text-grey-600">
          You have no courses in progress this term.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {courses.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white border border-grey-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 bg-primary" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wide text-primary">{c.code}</span>
                    <h2 className="font-serif text-xl font-semibold text-ink mt-0.5">{c.name}</h2>
                  </div>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">In Progress</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-grey-600 mb-4">
                  {c.teacher && <span className="flex items-center gap-1.5"><Icon name="user" size={16} /> {c.teacher}</span>}
                  <span className="flex items-center gap-1.5"><Icon name="chart" size={16} /> {c.credits} credits</span>
                </div>

                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-grey-600">Progress</span>
                  <span className="font-semibold text-ink">{c.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-grey-100 overflow-hidden mb-4">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink-700 transition-colors">
                    Open Course
                  </button>
                  <button className="rounded-lg border border-grey-200 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-grey-50 transition-colors">
                    Materials
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
