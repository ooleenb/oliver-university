import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import { Spinner, Alert } from '../../components/system/ui.jsx'
import { api } from '../../lib/api.js'
import { useAuth } from '../../auth.jsx'

// 时段/星期标签（与后端 day 0..4 = Mon..Fri、slot 0..3 对应）
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const SLOTS = ['09:00', '11:00', '13:00', '15:00']

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="rounded-2xl bg-white border border-grey-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-grey-600">{label}</span>
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-sand text-primary">
          <Icon name={icon} size={18} />
        </span>
      </div>
      <div className="font-serif text-3xl font-bold text-ink">{value}</div>
      {sub && <div className="text-xs text-grey-600 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [notes, setNotes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.student.summary().then(setData).catch((e) => setError(e.message))
    api.notifications.list().then((d) => setNotes(d.notifications)).catch(() => {})
  }, [])

  if (error) return <Alert>{error}</Alert>
  if (!data) return <Spinner />

  const { student, currentCourses } = data
  const pct = student.creditsRequired
    ? Math.round((student.creditsEarned / student.creditsRequired) * 100)
    : 0

  // 今天的课（周一=0…周五=4；周末则为空）
  const todayIndex = new Date().getDay() - 1
  const todayClasses = currentCourses
    .filter((c) => c.day === todayIndex && c.slot != null)
    .sort((a, b) => a.slot - b.slot)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        {user?.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-14 h-14 rounded-full object-cover ring-2 ring-grey-200 shrink-0"
          />
        )}
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">
            Hello, {student.name} 👋
          </h1>
          <p className="text-grey-600 mt-1">Welcome back to the student system — here's your overview for today.</p>
        </div>
      </div>

      {/* 统计卡 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="GPA" value={student.gpa} sub="Out of 4.0" icon="grades" />
        <StatCard label="Credits Earned" value={student.creditsEarned} sub={`of ${student.creditsRequired} required`} icon="chart" />
        <StatCard label="Courses This Term" value={currentCourses.length} sub="in progress" icon="courses" />
        <StatCard label="Progress" value={`${pct}%`} sub="toward graduation" icon="bulb" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 今日课程 */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-grey-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-ink">Today's Classes</h2>
            <Link to="/portal/timetable" className="text-sm font-semibold text-primary hover:underline">
              View full timetable
            </Link>
          </div>
          {todayClasses.length === 0 ? (
            <p className="rounded-xl bg-grey-50 p-4 text-sm text-grey-600">No classes scheduled for today. Enjoy your day!</p>
          ) : (
            <ul className="space-y-3">
              {todayClasses.map((c) => (
                <li key={c.id} className="flex items-center gap-4 rounded-xl bg-grey-50 p-4">
                  <div className="text-center shrink-0 w-14">
                    <div className="font-semibold text-ink">{SLOTS[c.slot]}</div>
                  </div>
                  <div className="w-1 h-10 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-ink">{c.name}</div>
                    <div className="text-sm text-grey-600">{c.code}</div>
                  </div>
                  {c.room && (
                    <div className="flex items-center gap-1.5 text-sm text-grey-600">
                      <Icon name="pin" size={16} />
                      {c.room}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 通知 */}
        <div className="rounded-2xl bg-white border border-grey-200 p-6">
          <h2 className="font-serif text-xl font-semibold text-ink mb-4">Notifications</h2>
          {notes.length === 0 ? (
            <p className="text-sm text-grey-600">You're all caught up.</p>
          ) : (
            <ul className="space-y-4">
              {notes.slice(0, 6).map((n) => (
                <li key={n.id} className="flex gap-3">
                  <span className="mt-1 grid place-items-center w-8 h-8 rounded-full bg-sand text-primary shrink-0">
                    <Icon name="bell" size={15} />
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-primary capitalize">{n.type}</span>
                    <p className="text-sm text-ink leading-snug">{n.text}</p>
                    <span className="text-xs text-grey-400">{n.created_at}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 课程进度 */}
      <div className="rounded-2xl bg-white border border-grey-200 p-6">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">Course Progress</h2>
        {currentCourses.length === 0 ? (
          <p className="text-sm text-grey-600">You have no courses in progress this term.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {currentCourses.map((c) => (
              <div key={c.id} className="rounded-xl border border-grey-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-ink">{c.name}</div>
                    <div className="text-xs text-grey-600">{c.code}{c.teacher ? ` · ${c.teacher}` : ''}</div>
                  </div>
                  <span className="text-sm font-semibold text-ink">{c.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-grey-100 overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
