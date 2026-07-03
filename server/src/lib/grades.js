// 成绩与 GPA 计算（前后端一致的评分口径）。

// 分数 → 等级：HD 85+ / D 75-84 / C 65-74 / P 50-64 / F <50
export function gradeFromScore(score) {
  if (score >= 85) return 'HD'
  if (score >= 75) return 'D'
  if (score >= 65) return 'C'
  if (score >= 50) return 'P'
  return 'F'
}

// 等级 → 4.0 制绩点
const POINTS = { HD: 4.0, D: 3.5, C: 2.5, P: 1.5, F: 0 }
export function gradePoint(grade) {
  return POINTS[grade] ?? 0
}

// 学分加权 GPA（4.0 制）。list: [{ score, credits }]
export function computeGpa(list) {
  const totalCredits = list.reduce((s, g) => s + (g.credits || 0), 0)
  if (!totalCredits) return 0
  const sum = list.reduce((s, g) => s + gradePoint(gradeFromScore(g.score)) * (g.credits || 0), 0)
  return Math.round((sum / totalCredits) * 100) / 100
}
