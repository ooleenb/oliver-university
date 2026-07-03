// 生成正式录取通知书 PDF（conditional / unconditional 两种版式）。
// 使用 pdfkit 手绘版式：校徽、校名、录取详情表、条件、校长手写体签名。
import PDFDocument from 'pdfkit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS = path.join(__dirname, '..', 'assets')
const CREST = path.join(ASSETS, 'crest.png')
const SIGNATURE_FONT = path.join(ASSETS, 'Sacramento-Regular.ttf')

// 品牌色
const INK = '#0a1f44'
const CRIMSON = '#b5122e'
const GOLD = '#c69121'
const GREY = '#6b7280'
const LINE = '#d8dde6'

// 学校信息（虚构，练手项目）
const UNI = {
  name: 'Oliver University',
  motto: 'Seek Your Potential',
  addressLines: ['1 University Avenue, Oliverton', 'Provider No. PRV00185  ·  CRICOS 01234A'],
  contact: 'admissions@oliver.edu  ·  +00 1 2345 6789  ·  oliver.edu',
  principal: 'Oliver Lee',
  principalTitle: 'Vice-Chancellor and President',
}

function money(n) {
  if (!n && n !== 0) return '—'
  return 'AUD $' + Number(n).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso.replace(' ', 'T'))
  if (isNaN(d)) return iso
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

// 依据 issued_at 推算若干里程碑日期
function addDays(iso, days) {
  const base = iso ? new Date(iso.replace(' ', 'T')) : new Date()
  const d = new Date(base.getTime() + days * 86400000)
  return d.toISOString().slice(0, 10)
}

/**
 * 把通知书写入 res（流式）。
 * @param {import('express').Response} res
 * @param {{offer:object, program:object, applicant:object, personal:object}} data
 */
export function streamOfferLetter(res, data) {
  const { offer, program, applicant, personal = {} } = data
  const conditional = offer.type === 'conditional'
  const ref = `OU-${new Date().getFullYear()}-${String(offer.id).padStart(5, '0')}`
  const issueDate = offer.issued_at || new Date().toISOString()
  const expiry = offer.expires_at || addDays(issueDate, 60)
  const commencement = addDays(issueDate, 120)

  const doc = new PDFDocument({ size: 'A4', margins: { top: 54, bottom: 60, left: 54, right: 54 } })
  doc.registerFont('sig', SIGNATURE_FONT)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="Offer_${ref}.pdf"`)
  doc.pipe(res)

  const left = doc.page.margins.left
  const right = doc.page.width - doc.page.margins.right
  const contentW = right - left

  // ---------- 页眉：校徽 + 校名 ----------
  try {
    doc.image(CREST, left, 46, { width: 56 })
  } catch {
    /* 校徽缺失则跳过 */
  }
  doc
    .fillColor(INK)
    .font('Times-Bold')
    .fontSize(22)
    .text(UNI.name, left + 70, 50)
  doc
    .fillColor(GOLD)
    .font('Times-Italic')
    .fontSize(11)
    .text(UNI.motto, left + 70, 76)

  // 右上：参考号 / 签发日期
  doc.font('Helvetica').fontSize(8.5).fillColor(GREY)
  doc.text(`Offer reference: ${ref}`, right - 200, 52, { width: 200, align: 'right' })
  doc.text(`Issue date: ${fmtDate(issueDate)}`, right - 200, 66, { width: 200, align: 'right' })

  // 金色分隔线
  doc.moveTo(left, 96).lineTo(right, 96).lineWidth(2).strokeColor(GOLD).stroke()

  let y = 116

  // ---------- 学生信息 ----------
  const detailPairs = [
    ['Student name', applicant.name],
    ['Applicant ID', `A${String(applicant.id).padStart(6, '0')}`],
    ['Date of birth', personal.dob ? fmtDate(personal.dob) : '—'],
    ['Nationality', personal.nationality || '—'],
    ['Email', applicant.email],
  ]
  doc.font('Helvetica').fontSize(9.5)
  detailPairs.forEach(([k, v]) => {
    doc.fillColor(GREY).text(k, left, y, { width: 110 })
    doc.fillColor(INK).font('Helvetica-Bold').text(String(v), left + 115, y, { width: contentW - 115 })
    doc.font('Helvetica')
    y += 15
  })

  y += 10

  // ---------- 录取类型徽标 ----------
  const badge = conditional ? 'CONDITIONAL OFFER OF ADMISSION' : 'UNCONDITIONAL OFFER OF ADMISSION'
  const badgeColor = conditional ? GOLD : CRIMSON
  doc.save()
  const bw = doc.font('Helvetica-Bold').fontSize(11).widthOfString(badge) + 28
  doc.roundedRect(left, y, bw, 26, 4).fillColor(badgeColor).fill()
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(badge, left + 14, y + 8)
  doc.restore()
  y += 44

  // ---------- 称呼 + 正文 ----------
  doc.fillColor(INK).font('Times-Roman').fontSize(11)
  doc.text(`Dear ${applicant.name},`, left, y)
  y = doc.y + 8

  const intro = conditional
    ? `On behalf of ${UNI.name}, I am pleased to make you a conditional offer of a place in the ${program.name}. This offer is subject to your meeting the conditions set out below. Once these conditions are satisfied, your place will be confirmed.`
    : `On behalf of ${UNI.name}, it is my great pleasure to offer you a place in the ${program.name}. You have met all of our admission requirements, and this is an unconditional offer of admission.`
  doc.font('Times-Roman').fontSize(11).fillColor('#1f2937').text(intro, left, y, { width: contentW, align: 'justify', lineGap: 2 })
  y = doc.y + 16

  // ---------- 录取详情表 ----------
  const deposit = program.tuition ? Math.round(program.tuition * 0.25) : null
  const rows = [
    ['Program', program.name],
    ['Course code', program.code],
    ['Study level', program.level],
    ['Faculty', program.faculty],
    ['Campus', 'Oliverton Campus'],
    ['Mode of study', 'Full-time · On campus'],
    ['Intake', 'Semester 1, ' + (new Date(commencement).getFullYear())],
    ['Commencement date', fmtDate(commencement)],
    ['Duration', program.duration || '—'],
    ['Indicative annual tuition', money(program.tuition)],
    ['Tuition deposit (on acceptance)', money(deposit)],
    ['Offer valid until', fmtDate(expiry)],
  ]
  const rowH = 20
  const labelW = 200
  doc.save()
  // 表格外框
  const tableTop = y
  const tableH = rows.length * rowH
  doc.rect(left, tableTop, contentW, tableH).lineWidth(0.8).strokeColor(LINE).stroke()
  rows.forEach((r, i) => {
    const ry = tableTop + i * rowH
    if (i % 2 === 0) {
      doc.rect(left, ry, contentW, rowH).fillColor('#f7f5f0').fill()
    }
    // 分隔竖线
    doc.moveTo(left + labelW, ry).lineTo(left + labelW, ry + rowH).lineWidth(0.6).strokeColor(LINE).stroke()
    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(9).text(r[0], left + 10, ry + 6, { width: labelW - 16 })
    doc.fillColor(INK).font('Helvetica').fontSize(9.5).text(String(r[1]), left + labelW + 10, ry + 6, { width: contentW - labelW - 18 })
  })
  doc.restore()
  y = tableTop + tableH + 18

  // ---------- 条件（仅 conditional） ----------
  if (conditional) {
    doc.fillColor(CRIMSON).font('Helvetica-Bold').fontSize(11).text('Conditions of this offer', left, y)
    y = doc.y + 4
    const condText = offer.conditions || 'Provision of certified evidence of completion of your qualifying studies.'
    const conditions = condText.split(/\n|;/).map((s) => s.trim()).filter(Boolean)
    doc.font('Times-Roman').fontSize(10.5).fillColor('#1f2937')
    conditions.forEach((c) => {
      doc.text('•', left + 4, y)
      doc.text(c, left + 18, y, { width: contentW - 22, lineGap: 1.5 })
      y = doc.y + 6
    })
    y += 6
  }

  // ---------- 如何接受 ----------
  doc.fillColor(INK).font('Times-Roman').fontSize(10.5)
  const accept = `To accept this offer, please sign in to your applicant portal at oliver.edu and select “Accept & enrol”. Upon acceptance you will be enrolled as a student and issued a student number. If you do not respond by ${fmtDate(expiry)}, this offer will lapse.`
  doc.text(accept, left, y, { width: contentW, align: 'justify', lineGap: 2 })
  y = doc.y + 22

  // ---------- 签名区 ----------
  if (y > doc.page.height - 170) {
    doc.addPage()
    y = doc.page.margins.top
  }
  doc.fillColor(INK).font('Times-Roman').fontSize(11).text('Yours sincerely,', left, y)
  y = doc.y + 4
  // 手写体签名
  doc.font('sig').fontSize(40).fillColor(INK).text(UNI.principal, left, y)
  y = doc.y + 2
  doc.moveTo(left, y).lineTo(left + 190, y).lineWidth(0.8).strokeColor(INK).stroke()
  y += 6
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(UNI.principal, left, y)
  doc.font('Helvetica').fontSize(9.5).fillColor(GREY).text(UNI.principalTitle, left, doc.y + 1)
  doc.text(UNI.name, left, doc.y + 1)

  // ---------- 页脚 ----------
  // 临时把下边距设为 0，避免在页边距区域写文字触发自动分页
  const savedBottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0
  const footY = doc.page.height - 52
  doc.moveTo(left, footY - 8).lineTo(right, footY - 8).lineWidth(0.6).strokeColor(LINE).stroke()
  doc.font('Helvetica').fontSize(7.5).fillColor(GREY)
  doc.text(UNI.addressLines.join('   ·   '), left, footY, { width: contentW, align: 'center', lineBreak: false })
  doc.text(UNI.contact, left, footY + 11, { width: contentW, align: 'center', lineBreak: false })
  doc.page.margins.bottom = savedBottom

  doc.end()
}
