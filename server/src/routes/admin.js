// 管理员路由：用户管理、专业管理、统计看板、审计日志。
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db, audit } from '../db.js'
import { authenticate, authorize } from '../auth.js'
import { ROLES } from '../config.js'

const router = Router()
router.use(authenticate, authorize(ROLES.ADMIN))

// ---------- 用户 ----------
router.get('/users', (req, res) => {
  const { role, q } = req.query
  let sql = 'SELECT id, email, role, name, student_no, created_at FROM users WHERE 1=1'
  const args = []
  if (role) {
    sql += ' AND role = ?'
    args.push(role)
  }
  if (q) {
    sql += ' AND (name LIKE ? OR email LIKE ?)'
    args.push(`%${q}%`, `%${q}%`)
  }
  sql += ' ORDER BY id DESC'
  res.json({ users: db.prepare(sql).all(...args) })
})

// 创建员工账号（招生办/管理员）
router.post('/users', (req, res) => {
  const { email, password, name, role } = req.body || {}
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  if (![ROLES.ADMISSIONS, ROLES.ADMIN, ROLES.STUDENT].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already in use' })
  }
  const hash = bcrypt.hashSync(password, 10)
  const info = db
    .prepare('INSERT INTO users (email, password_hash, role, name) VALUES (?,?,?,?)')
    .run(email.toLowerCase(), hash, role, name)
  audit(req.user.id, 'admin.user.create', 'user', info.lastInsertRowid, { role })
  const user = db.prepare('SELECT id, email, role, name, created_at FROM users WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json({ user })
})

// 编辑用户：姓名 / 邮箱 / 密码 / 角色 / 学号（按传入字段部分更新）
router.patch('/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const { name, email, password, role, studentNo } = req.body || {}
  const sets = []
  const args = []

  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ error: 'Name cannot be empty' })
    sets.push('name = ?'); args.push(String(name).trim())
  }
  if (email !== undefined) {
    const e = String(email).toLowerCase().trim()
    if (!e) return res.status(400).json({ error: 'Email cannot be empty' })
    const clash = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(e, user.id)
    if (clash) return res.status(409).json({ error: 'Email already in use' })
    sets.push('email = ?'); args.push(e)
  }
  if (role !== undefined) {
    if (![ROLES.APPLICANT, ROLES.STUDENT, ROLES.ADMISSIONS, ROLES.ADMIN].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }
    sets.push('role = ?'); args.push(role)
  }
  if (studentNo !== undefined) {
    sets.push('student_no = ?'); args.push(studentNo ? String(studentNo).trim() : null)
  }
  if (password !== undefined && password !== '') {
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    sets.push('password_hash = ?'); args.push(bcrypt.hashSync(String(password), 10))
    sets.push('password_must_reset = ?'); args.push(0) // 管理员已代设密码
  }

  if (!sets.length) {
    const current = db.prepare('SELECT id, email, role, name, student_no, created_at FROM users WHERE id = ?').get(user.id)
    return res.json({ user: current })
  }
  args.push(user.id)
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...args)
  audit(req.user.id, 'admin.user.update', 'user', user.id)
  const updated = db.prepare('SELECT id, email, role, name, student_no, created_at FROM users WHERE id = ?').get(user.id)
  res.json({ user: updated })
})

// 删除用户：同时清理其业务数据与在他表中的引用（外键约束下需按序处理）
router.delete('/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' })

  const del = db.transaction(() => {
    // 先解除其它记录对该用户的引用（这些列可为 NULL）
    db.prepare('UPDATE audit_log SET actor_id = NULL WHERE actor_id = ?').run(user.id)
    db.prepare('UPDATE offers SET issued_by = NULL WHERE issued_by = ?').run(user.id)
    db.prepare('UPDATE applications SET reviewer_id = NULL WHERE reviewer_id = ?').run(user.id)
    // 再删除该用户自身的业务数据（documents 随 applications 级联删除）
    db.prepare('DELETE FROM student_courses WHERE student_id = ?').run(user.id)
    db.prepare('DELETE FROM enrollments WHERE student_id = ?').run(user.id)
    db.prepare('DELETE FROM offers WHERE applicant_id = ?').run(user.id)
    db.prepare('DELETE FROM applications WHERE applicant_id = ?').run(user.id)
    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(user.id)
    db.prepare('DELETE FROM users WHERE id = ?').run(user.id)
  })
  del()
  audit(req.user.id, 'admin.user.delete', 'user', user.id, { email: user.email, role: user.role })
  res.json({ ok: true })
})

// ---------- 专业 ----------
router.post('/programs', (req, res) => {
  const { code, name, level, faculty, description, duration, tuition, capacity } = req.body || {}
  if (!code || !name || !level || !faculty) {
    return res.status(400).json({ error: 'Code, name, level and faculty are required' })
  }
  if (db.prepare('SELECT id FROM programs WHERE code = ?').get(code)) {
    return res.status(409).json({ error: 'A program with this code already exists' })
  }
  const info = db
    .prepare(
      'INSERT INTO programs (code, name, level, faculty, description, duration, tuition, capacity) VALUES (?,?,?,?,?,?,?,?)'
    )
    .run(code, name, level, faculty, description || null, duration || null, tuition || null, capacity || 50)
  audit(req.user.id, 'admin.program.create', 'program', info.lastInsertRowid)
  res.status(201).json({ program: db.prepare('SELECT * FROM programs WHERE id = ?').get(info.lastInsertRowid) })
})

router.patch('/programs/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id)
  if (!p) return res.status(404).json({ error: 'Program not found' })
  const fields = ['name', 'level', 'faculty', 'description', 'duration', 'tuition', 'capacity', 'is_open']
  const sets = []
  const args = []
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`)
      args.push(req.body[f])
    }
  }
  if (sets.length) {
    args.push(p.id)
    db.prepare(`UPDATE programs SET ${sets.join(', ')} WHERE id = ?`).run(...args)
  }
  audit(req.user.id, 'admin.program.update', 'program', p.id)
  res.json({ program: db.prepare('SELECT * FROM programs WHERE id = ?').get(p.id) })
})

// 删除专业：若仍有申请/offer/注册关联则拒绝（建议改为“关闭”），否则连同课程目录一起删除
router.delete('/programs/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id)
  if (!p) return res.status(404).json({ error: 'Program not found' })

  const apps = db.prepare('SELECT COUNT(*) c FROM applications WHERE program_id = ?').get(p.id).c
  const offs = db.prepare('SELECT COUNT(*) c FROM offers WHERE program_id = ?').get(p.id).c
  const enrs = db.prepare('SELECT COUNT(*) c FROM enrollments WHERE program_id = ?').get(p.id).c
  if (apps || offs || enrs) {
    return res.status(409).json({
      error: `Cannot delete: this program still has ${apps} application(s), ${offs} offer(s) and ${enrs} enrolment(s). Close it instead.`,
    })
  }

  const del = db.transaction(() => {
    db.prepare('DELETE FROM courses WHERE program_id = ?').run(p.id) // 目录课程一并删除
    db.prepare('DELETE FROM programs WHERE id = ?').run(p.id)
  })
  del()
  audit(req.user.id, 'admin.program.delete', 'program', p.id, { code: p.code })
  res.json({ ok: true })
})

// ---------- 统计看板 ----------
router.get('/stats', (req, res) => {
  const count = (sql, ...a) => db.prepare(sql).get(...a).c
  const byStatus = db
    .prepare("SELECT status, COUNT(*) c FROM applications WHERE status != 'draft' GROUP BY status")
    .all()
  res.json({
    users: {
      total: count('SELECT COUNT(*) c FROM users'),
      applicants: count('SELECT COUNT(*) c FROM users WHERE role = ?', ROLES.APPLICANT),
      students: count('SELECT COUNT(*) c FROM users WHERE role = ?', ROLES.STUDENT),
      staff: count("SELECT COUNT(*) c FROM users WHERE role IN ('admissions','admin')"),
    },
    programs: count('SELECT COUNT(*) c FROM programs'),
    applications: {
      total: count("SELECT COUNT(*) c FROM applications WHERE status != 'draft'"),
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.c])),
    },
    offers: {
      issued: count('SELECT COUNT(*) c FROM offers'),
      accepted: count("SELECT COUNT(*) c FROM offers WHERE status = 'accepted'"),
    },
  })
})

// ---------- 审计日志 ----------
router.get('/audit', (req, res) => {
  const rows = db
    .prepare(
      `SELECT al.*, u.name AS actor_name FROM audit_log al
       LEFT JOIN users u ON u.id = al.actor_id
       ORDER BY al.id DESC LIMIT 100`
    )
    .all()
  res.json({ audit: rows })
})

export default router
