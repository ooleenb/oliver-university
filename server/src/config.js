// 集中配置。生产环境应改用环境变量，切勿把密钥写进代码库。
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: process.env.PORT || 4000,
  // 练手项目用固定密钥；真实项目务必用随机环境变量。
  jwtSecret: process.env.JWT_SECRET || 'oliver-university-dev-secret-change-me',
  jwtExpiresIn: '7d',
  // 数据库与上传目录（都放在 server/ 下）
  dbFile: path.join(__dirname, '..', 'data.db'),
  uploadsDir: path.join(__dirname, '..', 'uploads'),
  // 头像单独放一个目录：可公开静态访问（相较申请材料不敏感）
  avatarsDir: path.join(__dirname, '..', 'uploads', 'avatars'),
  // 允许的前端来源
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}

export const ROLES = {
  APPLICANT: 'applicant',
  STUDENT: 'student',
  ADMISSIONS: 'admissions',
  ADMIN: 'admin',
}

// 申请状态机
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  INFO_REQUESTED: 'info_requested',
  OFFER_ISSUED: 'offer_issued',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  REJECTED: 'rejected',
}
