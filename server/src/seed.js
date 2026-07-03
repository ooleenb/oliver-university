// 种子数据：预置账号、专业、课程、演示学生的选课/成绩。可重复运行（会先清空业务表）。
import bcrypt from 'bcryptjs'
import { db } from './db.js'
import { ROLES } from './config.js'
import { COURSE_CATALOG, TEACHERS, CURRENT_TERM } from './data/courses.js'
import { gradeFromScore } from './lib/grades.js'

const hash = (pw) => bcrypt.hashSync(pw, 10)

// 执行播种。导出为函数，方便部署时“空库自动播种”调用（见 index.js）。
export function seed() {
  const tx = db.transaction(() => {
  // 清空（保留结构）。顺序注意外键。
  db.exec(`
    DELETE FROM audit_log;
    DELETE FROM notifications;
    DELETE FROM student_courses;
    DELETE FROM courses;
    DELETE FROM enrollments;
    DELETE FROM offers;
    DELETE FROM documents;
    DELETE FROM applications;
    DELETE FROM programs;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `)

  // ---- 账号（邮箱采用正式域名） ----
  const insUser = db.prepare('INSERT INTO users (email, password_hash, role, name, student_no) VALUES (?,?,?,?,?)')
  insUser.run('admin@oliver.edu.au', hash('admin123'), ROLES.ADMIN, 'Alex Morgan (Admin)', null)
  insUser.run('admission@oliver.edu.au', hash('admit123'), ROLES.ADMISSIONS, 'Priya Nair (Admissions)', null)
  insUser.run('100001@student.oliver.edu.au', hash('student123'), ROLES.STUDENT, 'Lin Yi', '100001')
  insUser.run('applicant@oliver.edu', hash('apply123'), ROLES.APPLICANT, 'Sofia Reyes', null)

  // ---- 专业 ----
  const insProg = db.prepare(
    'INSERT INTO programs (code, name, level, faculty, description, duration, tuition, capacity) VALUES (?,?,?,?,?,?,?,?)'
  )
  const programs = [
    ['BCS', 'Bachelor of Computer Science', 'Undergraduate', 'Engineering & Computer Science', 'Build software, study algorithms, AI and systems.', '3 years', 42000, 60],
    ['BENG', 'Bachelor of Engineering (Honours)', 'Undergraduate', 'Engineering & Computer Science', 'Design and build across mechanical, electrical and civil disciplines.', '4 years', 45000, 50],
    ['BBUS', 'Bachelor of Business', 'Undergraduate', 'Business', 'Management, finance, marketing and entrepreneurship.', '3 years', 38000, 80],
    ['BSCI', 'Bachelor of Science', 'Undergraduate', 'Science', 'Physics, chemistry, biology and mathematics.', '3 years', 39000, 70],
    ['LLB', 'Bachelor of Laws', 'Undergraduate', 'Law', 'Foundations of law, justice and advocacy.', '4 years', 44000, 40],
    ['MCS', 'Master of Computer Science', 'Postgraduate', 'Engineering & Computer Science', 'Advanced study in machine learning, security and distributed systems.', '2 years', 48000, 40],
    ['MBA', 'Master of Business Administration', 'Postgraduate', 'Business', 'Leadership, strategy and global management.', '2 years', 62000, 45],
    ['MPH', 'Master of Public Health', 'Postgraduate', 'Medicine & Health', 'Epidemiology, health policy and global health.', '2 years', 41000, 35],
    ['PHDCS', 'Doctor of Philosophy — Computer Science', 'Research', 'Engineering & Computer Science', 'Original research supervised by world-class faculty.', '4 years', 30000, 15],
  ]
  for (const p of programs) insProg.run(...p)

  // ---- 课程目录（按 COURSE_CATALOG 建，上课时段/老师按序分配） ----
  const insCourse = db.prepare(
    `INSERT INTO courses (program_id, code, name, credits, teacher, year_level, semester, day, slot, room)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  )
  let ci = 0
  for (const [progCode, list] of Object.entries(COURSE_CATALOG)) {
    const prog = db.prepare('SELECT id FROM programs WHERE code = ?').get(progCode)
    if (!prog) continue
    list.forEach((c, i) => {
      const teacher = TEACHERS[ci % TEACHERS.length]
      // 同一年级/学期内错开 day/slot，避免时间冲突
      const day = i % 5 // 0..4 Mon..Fri
      const slot = i % 4 // 0..3
      const room = `${['A', 'B', 'C', 'D'][ci % 4]}${101 + (ci % 20)}`
      insCourse.run(prog.id, c.code, c.name, c.credits, teacher, c.year, c.sem, day, slot, room)
      ci++
    })
  }

  // ---- 给演示申请人一个进行中的申请（已提交，等待审核） ----
  const applicant = db.prepare('SELECT id FROM users WHERE email = ?').get('applicant@oliver.edu')
  const bcs = db.prepare('SELECT id FROM programs WHERE code = ?').get('BCS')
  db.prepare(
    `INSERT INTO applications (applicant_id, program_id, status, personal, academic, statement, submitted_at)
     VALUES (?,?,?,?,?,?, datetime('now'))`
  ).run(
    applicant.id,
    bcs.id,
    'submitted',
    JSON.stringify({ dob: '2007-03-12', nationality: 'Spain', phone: '+34 600 123 456', address: 'Calle Mayor 1, Madrid' }),
    JSON.stringify({ gpa: '3.8 / 4.0', prevSchool: 'IES San Isidro', degree: 'High School Diploma' }),
    'I have loved building things with code since I was twelve, and I want to study computer science to turn curiosity into impact.'
  )

  // ---- 演示学生（Lin Yi, BCS）：注册专业 + 已完成一年级课程（含成绩）+ 在读二年级 S1 课程 ----
  const student = db.prepare('SELECT id FROM users WHERE email = ?').get('100001@student.oliver.edu.au')
  db.prepare('INSERT INTO enrollments (student_id, program_id) VALUES (?,?)').run(student.id, bcs.id)

  const courseByCode = (code) => db.prepare('SELECT id FROM courses WHERE code = ?').get(code)
  const insCompleted = db.prepare(
    `INSERT OR IGNORE INTO student_courses (student_id, course_id, term, status, progress, score, grade)
     VALUES (?,?,?, 'completed', 100, ?, ?)`
  )
  const insProgress = db.prepare(
    `INSERT OR IGNORE INTO student_courses (student_id, course_id, term, status, progress)
     VALUES (?,?,?, 'in_progress', ?)`
  )

  // 已完成：一年级（两个学期），带真实分数
  const completed = [
    ['COMP1100', 88, '2025 S1'],
    ['COMP1600', 79, '2025 S1'],
    ['MATH1005', 82, '2025 S1'],
    ['COMP1730', 91, '2025 S2'],
    ['ENGN1211', 74, '2025 S2'],
    ['STAT1008', 85, '2025 S2'],
  ]
  for (const [code, score, term] of completed) {
    const c = courseByCode(code)
    if (c) insCompleted.run(student.id, c.id, term, score, gradeFromScore(score))
  }

  // 在读：二年级 S1（当前学期），带进度
  const inProgress = [
    ['COMP2100', 68],
    ['COMP2400', 54],
    ['MATH2010', 80],
    ['COMP2550', 42],
  ]
  for (const [code, progress] of inProgress) {
    const c = courseByCode(code)
    if (c) insProgress.run(student.id, c.id, CURRENT_TERM, progress)
  }
})

  tx()
}

// 直接用 `node src/seed.js` 运行时才清库并打印结果；被 import 时不自动执行。
const runDirectly = process.argv[1] && process.argv[1].endsWith('seed.js')
if (runDirectly) {
  console.log('Seeding database...')
  seed()
  console.log('Seed complete. Demo accounts:')
  console.log('  admin@oliver.edu.au / admin123')
  console.log('  admission@oliver.edu.au / admit123')
  console.log('  100001@student.oliver.edu.au / student123')
  console.log('  applicant@oliver.edu / apply123')
  process.exit(0)
}
