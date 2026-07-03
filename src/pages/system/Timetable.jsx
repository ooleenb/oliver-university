import { useEffect, useState } from 'react'
import { Spinner, Alert } from '../../components/system/ui.jsx'
import { api } from '../../lib/api.js'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const SLOTS = ['09:00', '11:00', '13:00', '15:00']
const COLORS = ['bg-primary text-white', 'bg-ink text-white', 'bg-gold text-ink']

export default function Timetable() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.student.timetable().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <Alert>{error}</Alert>
  if (!data) return <Spinner />

  const { term, classes } = data

  // 按 day-slot 建索引；同一门课固定同色（按课程代码分配）
  const codes = [...new Set(classes.map((c) => c.code))]
  const colorForCode = (code) => COLORS[codes.indexOf(code) % COLORS.length]
  const cellMap = {}
  for (const c of classes) cellMap[`${c.day}-${c.slot}`] = c

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-1">Timetable</h1>
      <p className="text-grey-600 mb-6">{term}</p>

      <div className="rounded-2xl bg-white border border-grey-200 p-4 md:p-6 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* 表头 */}
          <div className="grid" style={{ gridTemplateColumns: `70px repeat(${DAYS.length}, 1fr)` }}>
            <div />
            {DAYS.map((d) => (
              <div key={d} className="text-center pb-3 font-semibold text-ink">{d}</div>
            ))}
          </div>

          {/* 时间行 */}
          {SLOTS.map((time, si) => (
            <div
              key={time}
              className="grid border-t border-grey-100"
              style={{ gridTemplateColumns: `70px repeat(${DAYS.length}, 1fr)` }}
            >
              <div className="py-2 pr-2 text-right text-sm text-grey-600">{time}</div>
              {DAYS.map((_, di) => {
                const cls = cellMap[`${di}-${si}`]
                return (
                  <div key={di} className="p-1.5">
                    {cls ? (
                      <div className={`rounded-lg p-2.5 h-full ${colorForCode(cls.code)}`}>
                        <div className="text-xs font-bold opacity-90">{cls.code}</div>
                        <div className="text-sm font-semibold leading-tight mt-0.5">{cls.name}</div>
                        {cls.room && <div className="text-xs opacity-80 mt-1">{cls.room}</div>}
                      </div>
                    ) : (
                      <div className="h-full min-h-[64px] rounded-lg bg-grey-50" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {classes.length === 0 && (
        <p className="mt-4 text-sm text-grey-600">No scheduled classes for this term.</p>
      )}
    </div>
  )
}
