// 鉴权工具：签发/校验 JWT，以及 Express 中间件。
import jwt from 'jsonwebtoken'
import { config } from './config.js'
import { db } from './db.js'

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

// 从 Authorization: Bearer <token> 解析并挂载 req.user
export function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = db.prepare('SELECT id, email, role, name, student_no FROM users WHERE id = ?').get(payload.sub)
    if (!user) return res.status(401).json({ error: 'User no longer exists' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// 角色守卫：authorize('admin','admissions')
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' })
    }
    next()
  }
}
