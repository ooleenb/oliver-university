// 通知路由：列出与标记已读。
import { Router } from 'express'
import { db } from '../db.js'
import { authenticate } from '../auth.js'

const router = Router()

// GET /api/notifications
router.get('/', authenticate, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50')
    .all(req.user.id)
  const unread = rows.filter((n) => !n.is_read).length
  res.json({ notifications: rows, unread })
})

// POST /api/notifications/:id/read
router.post('/:id/read', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ ok: true })
})

// POST /api/notifications/read-all
router.post('/read-all', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id)
  res.json({ ok: true })
})

export default router
