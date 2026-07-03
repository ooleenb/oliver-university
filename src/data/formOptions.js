// 申请表单用的静态选项集合。

export const TITLES = ['Mr', 'Ms', 'Mrs', 'Miss', 'Mx', 'Dr']

export const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say']

// 学历等级（从中学到研究型学位）
export const QUALIFICATION_LEVELS = [
  'High School / Secondary Certificate',
  'Foundation / Bridging Program',
  'Certificate (I–IV)',
  'Diploma',
  'Advanced Diploma',
  'Associate Degree',
  "Bachelor's Degree",
  "Bachelor's Degree (Honours)",
  'Graduate Certificate',
  'Graduate Diploma',
  "Master's Degree",
  'Doctoral Degree (PhD)',
]

// 年份下拉（近 60 年到明年）
const NOW = new Date().getFullYear()
export const YEARS = Array.from({ length: 62 }, (_, i) => String(NOW + 1 - i))
