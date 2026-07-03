// 鉴权路由：注册（仅申请人自助注册）、登录、当前用户。
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db, audit } from '../db.js'
import { signToken, authenticate } from '../auth.js'
import { ROLES } from '../config.js'

const router = Router()

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    name: u.name,
    firstName: u.first_name || null,
    middleName: u.middle_name || null,
    lastName: u.last_name || null,
    studentNo: u.student_no || null,
    avatarUrl: u.avatar ? `/api/avatars/${u.avatar}` : null,
    mustResetPassword: !!u.password_must_reset,
  }
}

// POST /api/auth/register —— 公众自助注册为申请人
router.post('/register', (req, res) => {
  const { email, password } = req.body || {}
  const firstName = String(req.body?.firstName || '').trim()
  const middleName = String(req.body?.middleName || '').trim()
  const lastName = String(req.body?.lastName || '').trim()
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'First name, last name, email and password are required' })
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (exists) return res.status(409).json({ error: 'An account with this email already exists' })

  // 组合展示用全名（中间名可选）
  const name = [firstName, middleName, lastName].filter(Boolean).join(' ')
  const hash = bcrypt.hashSync(password, 10)
  const info = db
    .prepare(
      'INSERT INTO users (email, password_hash, role, name, first_name, middle_name, last_name) VALUES (?,?,?,?,?,?,?)'
    )
    .run(email.toLowerCase(), hash, ROLES.APPLICANT, name, firstName, middleName || null, lastName)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  audit(user.id, 'register', 'user', user.id)
  const token = signToken(user)
  res.status(201).json({ token, user: publicUser(user) })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  audit(user.id, 'login', 'user', user.id)
  const token = signToken(user)
  res.json({ token, user: publicUser(user) })
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ user: publicUser(user) })
})

// POST /api/auth/set-password —— 已登录用户设置/重设自己的密码（用于新生录取后当场设密码）
router.post('/set-password', authenticate, (req, res) => {
  const { password } = req.body || {}
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  const hash = bcrypt.hashSync(String(password), 10)
  db.prepare('UPDATE users SET password_hash = ?, password_must_reset = 0 WHERE id = ?').run(hash, req.user.id)
  audit(req.user.id, 'auth.set_password', 'user', req.user.id)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ user: publicUser(user) })
})

export default router
