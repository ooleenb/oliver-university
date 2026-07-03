import { useEffect, useState } from 'react'
import { Spinner, Alert } from '../../components/system/ui.jsx'
import { api } from '../../lib/api.js'

const gradeColor = {
  HD: 'bg-primary/10 text-primary',
  D: 'bg-ink/10 text-ink',
  C: 'bg-gold/20 text-gold',
  P: 'bg-grey-100 text-grey-600',
  F: 'bg-red-100 text-red-700',
}

// 加权平均分
function weightedAverage(list) {
  const totalCredits = list.reduce((s, g) => s + (g.credits || 0), 0)
  if (!totalCredits) return '—'
  const sum = list.reduce((s, g) => s + (g.score || 0) * (g.credits || 0), 0)
  return (sum / totalCredits).toFixed(1)
}

export default function Grades() {
  const [grades, setGrades] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.student.grades()
      .then((d) => { setGrades(d.grades); setSummary(d.summary) })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <Alert>{error}</Alert>
  if (!grades) return <Spinner />

  const terms = [...new Set(grades.map((g) => g.term))]
  const avg = weightedAverage(grades)
  const totalCredits = grades.reduce((s, g) => s + (g.credits || 0), 0)

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-1">Grades</h1>
      <p className="text-grey-600 mb-6">Summary of results across past semesters</p>

      {/* 汇总卡 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-ink text-white p-5">
          <div className="text-sm text-white/70">GPA</div>
          <div className="font-serif text-4xl font-bold text-gold mt-1">{summary?.gpa ?? '—'}</div>
        </div>
        <div className="rounded-2xl bg-white border border-grey-200 p-5">
          <div className="text-sm text-grey-600">Weighted Average</div>
          <div className="font-serif text-4xl font-bold text-ink mt-1">{avg}</div>
        </div>
        <div className="rounded-2xl bg-white border border-grey-200 p-5">
          <div className="text-sm text-grey-600">Total Credits</div>
          <div className="font-serif text-4xl font-bold text-ink mt-1">{totalCredits}</div>
        </div>
        <div className="rounded-2xl bg-white border border-grey-200 p-5">
          <div className="text-sm text-grey-600">Courses Completed</div>
          <div className="font-serif text-4xl font-bold text-ink mt-1">{grades.length}</div>
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="rounded-2xl bg-white border border-grey-200 p-10 text-center text-grey-600">
          No completed courses yet. Your results will appear here at the end of the semester.
        </div>
      ) : (
        terms.map((term) => (
          <div key={term} className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-ink mb-3">{term}</h2>
            <div className="rounded-2xl bg-white border border-grey-200 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-grey-50 text-sm text-grey-600">
                    <th className="px-5 py-3 font-semibold">Code</th>
                    <th className="px-5 py-3 font-semibold">Course</th>
                    <th className="px-5 py-3 font-semibold text-center">Credits</th>
                    <th className="px-5 py-3 font-semibold text-center">Score</th>
                    <th className="px-5 py-3 font-semibold text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {grades.filter((g) => g.term === term).map((g) => (
                    <tr key={g.id} className="hover:bg-grey-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-grey-600">{g.code}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{g.name}</td>
                      <td className="px-5 py-3.5 text-center text-grey-600">{g.credits}</td>
                      <td className="px-5 py-3.5 text-center font-semibold text-ink">{g.score}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${gradeColor[g.grade] || gradeColor.P}`}>
                          {g.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <p className="text-xs text-grey-400">
        Grading: HD High Distinction (85+) · D Distinction (75-84) · C Credit (65-74) · P Pass (50-64) · F Fail (&lt;50)
      </p>
    </div>
  )
}
