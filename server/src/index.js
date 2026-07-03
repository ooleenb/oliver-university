// Express 应用入口。
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { db } from './db.js' // 触发建表
import { seed } from './seed.js'
import authRoutes from './routes/auth.js'
import programRoutes from './routes/programs.js'
import applicationRoutes from './routes/applications.js'
import offerRoutes from './routes/offers.js'
import notificationRoutes from './routes/notifications.js'
import adminRoutes from './routes/admin.js'
import geoRoutes from './routes/geo.js'
import studentRoutes from './routes/student.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 空库自动播种：部署到临时磁盘（如 Render 免费版）时，每次冷启动都会得到干净的演示数据；
// 而在同一个运行实例内注册的新账号会一直保留。
const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n
if (userCount === 0) {
  console.log('Empty database detected — seeding demo data...')
  seed()
}

const app = express()

app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json())

// 头像静态资源（公开访问，供 <img> 直接加载）
app.use('/api/avatars', express.static(config.avatarsDir))

// 健康检查
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'oliver-university-api' }))

app.use('/api/auth', authRoutes)
app.use('/api/programs', programRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/offers', offerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/geo', geoRoutes)
app.use('/api/student', studentRoutes)

// ---- 生产环境：托管已构建的前端（dist/），并对非 /api 路由回退到 index.html（SPA） ----
const distDir = path.join(__dirname, '..', '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

// 404（仅 /api 未命中时到达这里）
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// 统一错误处理（含 multer 错误）
app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500)
  res.status(status).json({ error: err.message || 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`Oliver University API listening on http://localhost:${config.port}`)
})

// ---- 保活心跳：防止免费实例休眠 ----
// Render 会自动注入 RENDER_EXTERNAL_URL（服务的公网地址）。每 10 分钟自己 ping 一次
// /api/health，让实例始终有流量、不会因 15 分钟空闲而休眠。仅生产环境生效。
const selfUrl = process.env.RENDER_EXTERNAL_URL
if (selfUrl) {
  const KEEP_ALIVE_MS = 10 * 60 * 1000 // 10 分钟 < Render 的 15 分钟空闲阈值
  setInterval(() => {
    fetch(`${selfUrl}/api/health`)
      .then((r) => console.log(`[keep-alive] ping ${r.status}`))
      .catch((e) => console.log(`[keep-alive] ping failed: ${e.message}`))
  }, KEEP_ALIVE_MS)
  console.log(`Keep-alive enabled → ${selfUrl}/api/health every 10 min`)
}
