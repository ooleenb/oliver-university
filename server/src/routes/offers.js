// Offer 路由：申请人查看、接受、拒绝、下载正式通知书 PDF。
import { Router } from 'express'
import { db, audit, notify } from '../db.js'
import { authenticate } from '../auth.js'
import { ROLES, APPLICATION_STATUS as S } from '../config.js'
import { streamOfferLetter } from '../pdf/offerLetter.js'
import { CURRENT_TERM } from '../data/courses.js'

const router = Router()

const STUDENT_EMAIL_DOMAIN = 'student.oliver.edu.au'

// 生成下一个 6 位纯数字学号（从 100001 起递增，保证唯一）
function nextStudentNo() {
  const row = db
    .prepare("SELECT MAX(CAST(student_no AS INTEGER)) AS m FROM users WHERE student_no GLOB '[0-9]*'")
    .get()
  const next = Math.max(100000, row?.m || 100000) + 1
  return String(next).padStart(6, '0')
}

function serializeOffer(o) {
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(o.program_id)
  return { ...o, program }
}

// GET /api/offers/mine
router.get('/mine', authenticate, (req, res) => {
  const rows = db.prepare('SELECT * FROM offers WHERE applicant_id = ? ORDER BY id DESC').all(req.user.id)
  res.json({ offers: rows.map(serializeOffer) })
})

// GET /api/offers/:id/letter —— 下载正式录取通知书 PDF（所有者或招生办/管理员）
router.get('/:id/letter', authenticate, (req, res) => {
  const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id)
  if (!offer) return res.status(404).json({ error: 'Offer not found' })
  const isStaff = [ROLES.ADMISSIONS, ROLES.ADMIN].includes(req.user.role)
  if (!isStaff && offer.applicant_id !== req.user.id) {
    return res.status(403).json({ error: 'This offer does not belong to you' })
  }
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(offer.program_id)
  const applicant = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(offer.applicant_id)
  const app = db.prepare('SELECT personal FROM applications WHERE id = ?').get(offer.application_id)
  const personal = app?.personal ? JSON.parse(app.personal) : {}
  audit(req.user.id, 'offer.letter.download', 'offer', offer.id)
  streamOfferLetter(res, { offer, program, applicant, personal })
})

function getOfferForUser(id, req, res) {
  const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(id)
  if (!offer) {
    res.status(404).json({ error: 'Offer not found' })
    return null
  }
  if (offer.applicant_id !== req.user.id) {
    res.status(403).json({ error: 'This offer does not belong to you' })
    return null
  }
  if (offer.status !== 'issued') {
    res.status(409).json({ error: 'You have already responded to this offer' })
    return null
  }
  return offer
}

// POST /api/offers/:id/accept —— 接受 offer，转为在校生
router.post('/:id/accept', authenticate, (req, res) => {
  const offer = getOfferForUser(req.params.id, req, res)
  if (!offer) return

  // 生成 6 位学号与学生邮箱（学号@student.oliver.edu.au）
  const studentNo = nextStudentNo()
  const studentEmail = `${studentNo}@${STUDENT_EMAIL_DOMAIN}`

  const tx = db.transaction(() => {
    db.prepare("UPDATE offers SET status = 'accepted', responded_at = datetime('now') WHERE id = ?").run(offer.id)
    db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(S.ACCEPTED, offer.application_id)
    // 升级为在校生：换成学生邮箱、写入学号、需重设密码（password_must_reset=1）
    db.prepare(
      'UPDATE users SET role = ?, student_no = ?, email = ?, password_must_reset = 1 WHERE id = ?'
    ).run(ROLES.STUDENT, studentNo, studentEmail, offer.applicant_id)
    db.prepare('INSERT INTO enrollments (student_id, program_id) VALUES (?,?)').run(
      offer.applicant_id,
      offer.program_id
    )
    // 自动注册该专业一年级第一学期课程（在读）
    const firstSem = db
      .prepare("SELECT id FROM courses WHERE program_id = ? AND year_level = 1 AND semester = 'S1'")
      .all(offer.program_id)
    const insSC = db.prepare(
      "INSERT OR IGNORE INTO student_courses (student_id, course_id, term, status, progress) VALUES (?,?,?, 'in_progress', 0)"
    )
    for (const c of firstSem) insSC.run(offer.applicant_id, c.id, CURRENT_TERM)
  })
  tx()

  const user = db.prepare('SELECT id, email, role, name, student_no FROM users WHERE id = ?').get(offer.applicant_id)
  notify(user.id, 'enrolment', `Welcome to Oliver University! Your student number is ${user.student_no}.`)
  audit(user.id, 'offer.accept', 'offer', offer.id)
  res.json({
    offer: { ...offer, status: 'accepted' },
    student: { id: user.id, email: user.email, name: user.name, studentNo: user.student_no },
  })
})

// POST /api/offers/:id/decline
router.post('/:id/decline', authenticate, (req, res) => {
  const offer = getOfferForUser(req.params.id, req, res)
  if (!offer) return
  db.prepare("UPDATE offers SET status = 'declined', responded_at = datetime('now') WHERE id = ?").run(offer.id)
  db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(S.DECLINED, offer.application_id)
  audit(req.user.id, 'offer.decline', 'offer', offer.id)
  res.json({ offer: { ...offer, status: 'declined' } })
})

export default router
