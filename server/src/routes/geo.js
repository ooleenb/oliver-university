// 地址参考数据：澳大利亚 suburb / state / postcode 自动补全（模拟真实地址查找服务）。
import { Router } from 'express'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const suburbs = require('../data/auSuburbs.json') // [{ s: suburb, t: state, p: postcode }]

const router = Router()

// GET /api/geo/au-address?q=carl —— 按 suburb 前缀/包含匹配，返回至多 20 条
router.get('/au-address', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase()
  if (q.length < 2) return res.json({ results: [] })

  const starts = []
  const contains = []
  for (const r of suburbs) {
    const s = r.s.toLowerCase()
    if (s.startsWith(q)) {
      if (starts.length < 20) starts.push(r)
    } else if (s.includes(q) && contains.length < 20) {
      contains.push(r)
    }
    if (starts.length >= 20) break
  }
  const results = [...starts, ...contains]
    .slice(0, 20)
    .map((r) => ({ suburb: r.s, state: r.t, postcode: r.p }))
  res.json({ results })
})

export default router
