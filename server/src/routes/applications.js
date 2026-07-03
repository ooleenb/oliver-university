// 申请路由：申请人提交/管理自己的申请；招生办审核与决定。
import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import crypto from 'node:crypto'
import { db, audit, notify } from '../db.js'
import { authenticate, authorize } from '../auth.js'
import { ROLES, APPLICATION_STATUS as S, config } from '../config.js'

const router = Router()

// ---- 文件上传配置（材料存到 uploads/） ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } })

// ---- 序列化辅助 ----
function serialize(app) {
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(app.program_id)
  const applicant = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(app.applicant_id)
  const documents = db
    .prepare('SELECT id, type, original_name, size, uploaded_at FROM documents WHERE application_id = ?')
    .all(app.id)
  const offer = db
    .prepare('SELECT * FROM offers WHERE application_id = ? ORDER BY id DESC LIMIT 1')
    .get(app.id)
  return {
    id: app.id,
    status: app.status,
    program,
    applicant,
    personal: app.personal ? JSON.parse(app.personal) : {},
    academic: app.academic ? JSON.parse(app.academic) : {},
    statement: app.statement || '',
    reviewNotes: app.review_notes || '',
    documents,
    offer: offer || null,
    createdAt: app.created_at,
    submittedAt: app.submitted_at,
    decidedAt: app.decided_at,
  }
}

function getAppOr404(id, res) {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(id)
  if (!app) {
    res.status(404).json({ error: 'Application not found' })
    return null
  }
  return app
}

// ========================= 申请人 =========================

// GET /api/applications/mine
router.get('/mine', authenticate, authorize(ROLES.APPLICANT, ROLES.STUDENT), (req, res) => {
  const rows = db
    .prepare('SELECT * FROM applications WHERE applicant_id = ? ORDER BY id DESC')
    .all(req.user.id)
  res.json({ applications: rows.map(serialize) })
})

// POST /api/applications —— 创建草稿
router.post('/', authenticate, authorize(ROLES.APPLICANT, ROLES.STUDENT), (req, res) => {
  const { programId } = req.body || {}
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(programId)
  if (!program) return res.status(400).json({ error: 'Please choose a valid program' })
  const dup = db
    .prepare("SELECT id FROM applications WHERE applicant_id = ? AND program_id = ? AND status NOT IN ('rejected','declined')")
    .get(req.user.id, programId)
  if (dup) return res.status(409).json({ error: 'You already have an active application for this program' })

  const info = db
    .prepare('INSERT INTO applications (applicant_id, program_id, status) VALUES (?,?,?)')
    .run(req.user.id, programId, S.DRAFT)
  audit(req.user.id, 'application.create', 'application', info.lastInsertRowid, { programId })
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json({ application: serialize(app) })
})

// GET /api/applications/:id —— 所有者或招生办/管理员
router.get('/:id', authenticate, (req, res) => {
  const app = getAppOr404(req.params.id, res)
  if (!app) return
  const isStaff = [ROLES.ADMISSIONS, ROLES.ADMIN].includes(req.user.role)
  if (!isStaff && app.applicant_id !== req.user.id) {
    return res.status(403).json({ error: 'You cannot view this application' })
  }
  res.json({ application: serialize(app) })
})

// PATCH /api/applications/:id —— 编辑草稿/补材料阶段
router.patch('/:id', authenticate, (req, res) => {
  const app = getAppOr404(req.params.id, res)
  if (!app) return
  if (app.applicant_id !== req.user.id) return res.status(403).json({ error: 'Not your application' })
  if (![S.DRAFT, S.INFO_REQUESTED].includes(app.status)) {
    return res.status(409).json({ error: 'This application can no longer be edited' })
  }
  const { personal, academic, statement } = req.body || {}
  db.prepare(
    'UPDATE applications SET personal = COALESCE(?, personal), academic = COALESCE(?, academic), statement = COALESCE(?, statement) WHERE id = ?'
  ).run(
    personal ? JSON.stringify(personal) : null,
    academic ? JSON.stringify(academic) : null,
    statement ?? null,
    app.id
  )
  const updated = db.prepare('SELECT * FROM applications WHERE id = ?').get(app.id)
  res.json({ application: serialize(updated) })
})

// POST /api/applications/:id/documents —— 上传材料
router.post('/:id/documents', authenticate, upload.single('file'), (req, res) => {
  const app = getAppOr404(req.params.id, res)
  if (!app) return
  if (app.applicant_id !== req.user.id) return res.status(403).json({ error: 'Not your application' })
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const type = req.body.type || 'other'
  db.prepare(
    'INSERT INTO documents (application_id, type, original_name, stored_name, size) VALUES (?,?,?,?,?)'
  ).run(app.id, type, req.file.originalname, req.file.filename, req.file.size)
  audit(req.user.id, 'application.upload', 'application', app.id, { type })
  const updated = db.prepare('SELECT * FROM applications WHERE id = ?').get(app.id)
  res.status(201).json({ application: serialize(updated) })
})

// GET /api/applications/:id/documents/:docId —— 下载材料
router.get('/:id/documents/:docId', authenticate, (req, res) => {
  const app = getAppOr404(req.params.id, res)
  if (!app) return
  const isStaff = [ROLES.ADMISSIONS, ROLES.ADMIN].includes(req.user.role)
  if (!isStaff && app.applicant_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const doc = db
    .prepare('SELECT * FROM documents WHERE id = ? AND application_id = ?')
    .get(req.params.docId, app.id)
  if (!doc) return res.status(404).json({ error: 'Document not found' })
  res.download(path.join(config.uploadsDir, doc.stored_name), doc.original_name)
})

// POST /api/applications/:id/submit —— 提交申请
router.post('/:id/submit', authenticate, (req, res) => {
  const app = getAppOr404(req.params.id, res)
  if (!app) return
  if (app.applicant_id !== req.user.id) return res.status(403).json({ error: 'Not your application' })
  if (![S.DRAFT, S.INFO_REQUESTED].includes(app.status)) {
    return res.status(409).json({ error: 'This application has already been submitted' })
  }
  // 基础完整性校验
  const personal = app.personal ? JSON.parse(app.personal) : {}
  const academic = app.academic ? JSON.parse(app.academic) : {}
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(app.program_id)
  const documents = db.prepare('SELECT type FROM documents WHERE application_id = ?').all(app.id)
  const missing = []

  // 个人信息
  if (!personal.dob || !personal.gender || !personal.nationality || !personal.phone) {
    missing.push('personal details')
  }
  // 地址（按 overseas / australia 分别校验）
  const addr = personal.address || {}
  const addrOk =
    addr.mode === 'OS'
      ? Boolean(addr.line1 && addr.city && addr.country)
      : Boolean(addr.streetNo && addr.street && addr.suburb && addr.state)
  if (!addrOk) missing.push('residential address')

  // 学术经历（数组，至少一条含 institution + qualification）
  const records = Array.isArray(academic) ? academic : []
  const validAcademic = records.filter((r) => r && r.institution && r.qualification)
  if (validAcademic.length === 0) missing.push('academic history')

  // 个人陈述
  if (!app.statement || app.statement.trim().length < 20) missing.push('personal statement')

  // 必需文件
  const pg = /master|phd|doctor|postgrad|research/.test(String(program?.level || '').toLowerCase())
  const requiredDocs = ['passport', 'transcript', 'english_test', ...(pg ? ['certificate', 'cv'] : [])]
  const haveTypes = new Set(documents.map((d) => d.type))
  const missingDocs = requiredDocs.filter((t) => !haveTypes.has(t))
  if (missingDocs.length) missing.push('required documents')

  if (missing.length) {
    return res.status(400).json({ error: `Please complete: ${missing.join(', ')}` })
  }
  db.prepare("UPDATE applications SET status = ?, submitted_at = datetime('now') WHERE id = ?").run(
    S.SUBMITTED,
    app.id
  )
  audit(req.user.id, 'application.submit', 'application', app.id)
  notify(req.user.id, 'application', 'Your application has been submitted and is awaiting review.')
  const updated = db.prepare('SELECT * FROM applications WHERE id = ?').get(app.id)
  res.json({ application: serialize(updated) })
})

// ========================= 招生办 / 管理员 =========================

// GET /api/applications —— 列表（可按状态/关键字筛选）
router.get('/', authenticate, authorize(ROLES.ADMISSIONS, ROLES.ADMIN), (req, res) => {
  const { status, q } = req.query
  let sql = `SELECT a.* FROM applications a JOIN users u ON u.id = a.applicant_id WHERE a.status != 'draft'`
  const args = []
  if (status) {
    sql += ' AND a.status = ?'
    args.push(status)
  }
  if (q) {
    sql += ' AND (u.name LIKE ? OR u.email LIKE ?)'
    args.push(`%${q}%`, `%${q}%`)
  }
  sql += ' ORDER BY a.submitted_at DESC, a.id DESC'
  res.json({ applications: db.prepare(sql).all(...args).map(serialize) })
})

// POST /api/applications/:id/review —— 开始审核 / 要求补材料
router.post('/:id/review', authenticate, authorize(ROLES.ADMISSIONS, ROLES.ADMIN), (req, res) => {
  const app = getAppOr404(req.params.id, res)
  if (!app) return
  const { action, notes } = req.body || {}
  if (action === 'start') {
    db.prepare('UPDATE applications SET status = ?, reviewer_id = ? WHERE id = ?').run(
      S.UNDER_REVIEW,
      req.user.id,
      app.id
    )
  } else if (action === 'request_info') {
    if (!notes) return res.status(400).json({ error: 'Please describe what information is needed' })
    db.prepare('UPDATE applications SET status = ?, reviewer_id = ?, review_notes = ? WHERE id = ?').run(
      S.INFO_REQUESTED,
      req.user.id,
      notes,
      app.id
    )
    notify(app.applicant_id, 'application', `Additional information requested: ${notes}`)
  } else {
    return res.status(400).json({ error: 'Unknown review action' })
  }
  audit(req.user.id, `application.review.${action}`, 'application', app.id)
  const updated = db.prepare('SELECT * FROM applications WHERE id = ?').get(app.id)
  res.json({ application: serialize(updated) })
})

// POST /api/applications/:id/decision —— 通过并发 offer / 拒绝
router.post('/:id/decision', authenticate, authorize(ROLES.ADMISSIONS, ROLES.ADMIN), (req, res) => {
  const app = getAppOr404(req.params.id, res)
  if (!app) return
  if ([S.ACCEPTED, S.DECLINED, S.REJECTED].includes(app.status)) {
    return res.status(409).json({ error: 'A final decision has already been made' })
  }
  const { decision, offerType, conditions, expiresAt } = req.body || {}

  if (decision === 'approve') {
    const tx = db.transaction(() => {
      db.prepare("UPDATE applications SET status = ?, reviewer_id = ?, decided_at = datetime('now') WHERE id = ?").run(
        S.OFFER_ISSUED,
        req.user.id,
        app.id
      )
      db.prepare(
        `INSERT INTO offers (application_id, applicant_id, program_id, type, conditions, issued_by, expires_at)
         VALUES (?,?,?,?,?,?,?)`
      ).run(
        app.id,
        app.applicant_id,
        app.program_id,
        offerType === 'conditional' ? 'conditional' : 'unconditional',
        conditions || null,
        req.user.id,
        expiresAt || null
      )
    })
    tx()
    const program = db.prepare('SELECT name FROM programs WHERE id = ?').get(app.program_id)
    notify(app.applicant_id, 'offer', `Congratulations! You have received an offer for ${program.name}.`)
    audit(req.user.id, 'application.approve', 'application', app.id)
  } else if (decision === 'reject') {
    db.prepare("UPDATE applications SET status = ?, reviewer_id = ?, review_notes = ?, decided_at = datetime('now') WHERE id = ?").run(
      S.REJECTED,
      req.user.id,
      conditions || app.review_notes || null,
      app.id
    )
    notify(app.applicant_id, 'application', 'A decision has been made on your application. Please check your portal.')
    audit(req.user.id, 'application.reject', 'application', app.id)
  } else {
    return res.status(400).json({ error: 'Decision must be approve or reject' })
  }
  const updated = db.prepare('SELECT * FROM applications WHERE id = ?').get(app.id)
  res.json({ application: serialize(updated) })
})

export default router
