// 学生端路由：课程、成绩、课表、概览、头像。数据全部来自数据库（真实选课/成绩）。
import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { db, audit } from '../db.js'
import { authenticate, authorize } from '../auth.js'
import { ROLES, config } from '../config.js'
import { CREDITS_REQUIRED, CURRENT_TERM } from '../data/courses.js'
import { computeGpa } from '../lib/grades.js'

const router = Router()
router.use(authenticate, authorize(ROLES.STUDENT))

// ---- 头像上传配置：仅图片、≤2MB，存到 uploads/avatars ----
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.avatarsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
      cb(null, `u${req.user.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype)) cb(null, true)
    else cb(Object.assign(new Error('Only image files are allowed'), { status: 400 }))
  },
})

// 取某学生当前专业（最近一次报读）
function getProgram(studentId) {
  return db
    .prepare(
      `SELECT p.* FROM enrollments e JOIN programs p ON p.id = e.program_id
       WHERE e.student_id = ? ORDER BY e.id DESC LIMIT 1`
    )
    .get(studentId)
}

// 取选课记录（可按状态过滤）
function getStudentCourses(studentId, status) {
  let sql = `SELECT sc.id, sc.term, sc.status, sc.progress, sc.score, sc.grade,
                    c.code, c.name, c.credits, c.teacher, c.day, c.slot, c.room, c.year_level, c.semester
             FROM student_courses sc JOIN courses c ON c.id = sc.course_id
             WHERE sc.student_id = ?`
  const args = [studentId]
  if (status) {
    sql += ' AND sc.status = ?'
    args.push(status)
  }
  sql += ' ORDER BY sc.term DESC, c.code ASC'
  return db.prepare(sql).all(...args)
}

// 计算学业概况
function academicSummary(studentId, program) {
  const completed = getStudentCourses(studentId, 'completed')
  const creditsEarned = completed.reduce((s, c) => s + (c.credits || 0), 0)
  const creditsRequired = CREDITS_REQUIRED[program?.level] || 144
  const gpa = computeGpa(completed.map((c) => ({ score: c.score, credits: c.credits })))
  const yearNumber = Math.min(Math.floor(creditsEarned / 48) + 1, 4)
  const yearLabel = ['First', 'Second', 'Third', 'Fourth'][yearNumber - 1] + ' Year'
  return { creditsEarned, creditsRequired, gpa, yearNumber, yearLabel }
}

// GET /api/student/summary —— 仪表盘概览
router.get('/summary', (req, res) => {
  const program = getProgram(req.user.id)
  const me = db.prepare('SELECT id, name, student_no FROM users WHERE id = ?').get(req.user.id)
  const current = getStudentCourses(req.user.id, 'in_progress')
  const summary = academicSummary(req.user.id, program)
  res.json({
    student: {
      id: me.id,
      name: me.name,
      studentNo: me.student_no,
      program: program ? { code: program.code, name: program.name, level: program.level } : null,
      term: CURRENT_TERM,
      ...summary,
    },
    currentCourses: current,
  })
})

// GET /api/student/courses —— 本学期在读课程
router.get('/courses', (req, res) => {
  res.json({ courses: getStudentCourses(req.user.id, 'in_progress') })
})

// GET /api/student/grades —— 已完成课程成绩
router.get('/grades', (req, res) => {
  const program = getProgram(req.user.id)
  const completed = getStudentCourses(req.user.id, 'completed')
  res.json({
    grades: completed,
    summary: academicSummary(req.user.id, program),
  })
})

// POST /api/student/avatar —— 上传/更换头像
router.post('/avatar', avatarUpload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' })
  // 删除旧头像文件（若有）
  const prev = db.prepare('SELECT avatar FROM users WHERE id = ?').get(req.user.id)?.avatar
  if (prev) {
    fs.rm(path.join(config.avatarsDir, prev), () => {}) // 静默失败即可
  }
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(req.file.filename, req.user.id)
  audit(req.user.id, 'student.avatar.update', 'user', req.user.id)
  res.status(201).json({ avatarUrl: `/api/avatars/${req.file.filename}` })
})

// GET /api/student/timetable —— 当前学期课表
router.get('/timetable', (req, res) => {
  const current = getStudentCourses(req.user.id, 'in_progress').filter((c) => c.day != null && c.slot != null)
  res.json({
    term: CURRENT_TERM,
    classes: current.map((c) => ({
      day: c.day,
      slot: c.slot,
      code: c.code,
      name: c.name,
      room: c.room,
    })),
  })
})

export default router
