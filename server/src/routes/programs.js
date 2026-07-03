// 专业路由：公开查询；创建/修改仅管理员（在 admin 路由里处理写操作）。
import { Router } from 'express'
import { db } from '../db.js'

const router = Router()

// GET /api/programs —— 公开，列出开放的专业
router.get('/', (req, res) => {
  const { level, q } = req.query
  let sql = 'SELECT * FROM programs WHERE 1=1'
  const args = []
  if (level) {
    sql += ' AND level = ?'
    args.push(level)
  }
  if (q) {
    sql += ' AND (name LIKE ? OR faculty LIKE ? OR code LIKE ?)'
    args.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }
  sql += ' ORDER BY level, name'
  res.json({ programs: db.prepare(sql).all(...args) })
})

// GET /api/programs/:id
router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id)
  if (!p) return res.status(404).json({ error: 'Program not found' })
  res.json({ program: p })
})

export default router
