// SQLite 连接与建表。使用 better-sqlite3（同步 API，适合练手，性能足够）。
import Database from 'better-sqlite3'
import fs from 'node:fs'
import { config } from './config.js'

// 确保上传目录存在（含头像子目录）
fs.mkdirSync(config.uploadsDir, { recursive: true })
fs.mkdirSync(config.avatarsDir, { recursive: true })

export const db = new Database(config.dbFile)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// 建表（IF NOT EXISTS，可重复执行）
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK (role IN ('applicant','student','admissions','admin')),
  name          TEXT    NOT NULL,
  student_no    TEXT,                       -- 转为在校生后分配的学号
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS programs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  level       TEXT    NOT NULL,             -- Undergraduate / Postgraduate / Research
  faculty     TEXT    NOT NULL,
  description TEXT,
  duration    TEXT,
  tuition     INTEGER,
  capacity    INTEGER DEFAULT 50,
  is_open     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS applications (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_id  INTEGER NOT NULL REFERENCES users(id),
  program_id    INTEGER NOT NULL REFERENCES programs(id),
  status        TEXT    NOT NULL DEFAULT 'draft',
  personal      TEXT,                       -- JSON: dob, nationality, phone, address
  academic      TEXT,                       -- JSON: gpa, prevSchool, degree
  statement     TEXT,                       -- 个人陈述
  review_notes  TEXT,                       -- 招生办审核备注 / 补材料说明
  reviewer_id   INTEGER REFERENCES users(id),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  submitted_at  TEXT,
  decided_at    TEXT
);

CREATE TABLE IF NOT EXISTS documents (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type           TEXT    NOT NULL,          -- transcript / passport / english_test / other
  original_name  TEXT    NOT NULL,
  stored_name    TEXT    NOT NULL,
  size           INTEGER,
  uploaded_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS offers (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  applicant_id   INTEGER NOT NULL REFERENCES users(id),
  program_id     INTEGER NOT NULL REFERENCES programs(id),
  type           TEXT    NOT NULL DEFAULT 'unconditional', -- unconditional / conditional
  conditions     TEXT,
  status         TEXT    NOT NULL DEFAULT 'issued',        -- issued / accepted / declined
  issued_by      INTEGER REFERENCES users(id),
  issued_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at     TEXT,
  responded_at   TEXT
);

CREATE TABLE IF NOT EXISTS enrollments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  INTEGER NOT NULL REFERENCES users(id),
  program_id  INTEGER NOT NULL REFERENCES programs(id),
  status      TEXT    NOT NULL DEFAULT 'active',
  enrolled_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 课程目录：隶属某个专业，含年级/学期与固定的每周上课时段
CREATE TABLE IF NOT EXISTS courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id  INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  code        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  credits     INTEGER NOT NULL DEFAULT 6,
  teacher     TEXT,
  year_level  INTEGER NOT NULL DEFAULT 1,      -- 1 / 2 / 3 …
  semester    TEXT    NOT NULL DEFAULT 'S1',    -- S1 / S2
  day         INTEGER,                          -- 0=Mon … 4=Fri
  slot        INTEGER,                          -- 0..3 时间段
  room        TEXT
);

-- 学生选课与成绩：一条 = 某学生某学期修某门课
CREATE TABLE IF NOT EXISTS student_courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  term        TEXT    NOT NULL,                 -- 如 '2026 S1'
  status      TEXT    NOT NULL DEFAULT 'in_progress', -- in_progress / completed
  progress    INTEGER NOT NULL DEFAULT 0,        -- 0..100（在读进度）
  score       INTEGER,                           -- 完成后的分数 0..100
  grade       TEXT,                              -- HD / D / C / P / F
  UNIQUE(student_id, course_id, term)
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  type       TEXT    NOT NULL,
  text       TEXT    NOT NULL,
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id   INTEGER REFERENCES users(id),
  action     TEXT    NOT NULL,
  entity     TEXT,
  entity_id  INTEGER,
  meta       TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
`)

// 轻量迁移：为已存在的库补充姓名分列（首名 / 中间名 / 姓）及“需重设密码”标记
for (const col of ['first_name TEXT', 'middle_name TEXT', 'last_name TEXT', 'password_must_reset INTEGER NOT NULL DEFAULT 0', 'avatar TEXT']) {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN ${col}`)
  } catch {
    // 列已存在则忽略
  }
}

// 审计日志辅助
export function audit(actorId, action, entity, entityId, meta) {
  db.prepare(
    'INSERT INTO audit_log (actor_id, action, entity, entity_id, meta) VALUES (?,?,?,?,?)'
  ).run(actorId ?? null, action, entity ?? null, entityId ?? null, meta ? JSON.stringify(meta) : null)
}

// 通知辅助
export function notify(userId, type, text) {
  db.prepare('INSERT INTO notifications (user_id, type, text) VALUES (?,?,?)').run(userId, type, text)
}
