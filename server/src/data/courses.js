// 各专业的课程目录（按专业代码分组）。seed 会据此建 courses 表。
// 每条：{ code, name, credits, year, sem }；上课时段(day/slot/room)与授课老师在 seed 里按序自动分配。

export const COURSE_CATALOG = {
  // 计算机科学（本科）——给演示学生用，课程较全
  BCS: [
    { code: 'COMP1100', name: 'Introduction to Programming', credits: 12, year: 1, sem: 'S1' },
    { code: 'COMP1600', name: 'Foundations of Computing', credits: 12, year: 1, sem: 'S1' },
    { code: 'MATH1005', name: 'Discrete Mathematics', credits: 6, year: 1, sem: 'S1' },
    { code: 'COMP1730', name: 'Programming Practice', credits: 12, year: 1, sem: 'S2' },
    { code: 'ENGN1211', name: 'Engineering Systems', credits: 12, year: 1, sem: 'S2' },
    { code: 'STAT1008', name: 'Foundations of Statistics', credits: 6, year: 1, sem: 'S2' },
    { code: 'COMP2100', name: 'Data Structures & Algorithms', credits: 12, year: 2, sem: 'S1' },
    { code: 'COMP2400', name: 'Database Systems', credits: 12, year: 2, sem: 'S1' },
    { code: 'MATH2010', name: 'Linear Algebra', credits: 6, year: 2, sem: 'S1' },
    { code: 'COMP2550', name: 'Introduction to Artificial Intelligence', credits: 12, year: 2, sem: 'S1' },
    { code: 'COMP2300', name: 'Computer Organisation & Networks', credits: 12, year: 2, sem: 'S2' },
    { code: 'COMP2620', name: 'Logic', credits: 6, year: 2, sem: 'S2' },
  ],
  BENG: [
    { code: 'ENGN1000', name: 'Engineering Design & Innovation', credits: 12, year: 1, sem: 'S1' },
    { code: 'MATH1001', name: 'Calculus I', credits: 6, year: 1, sem: 'S1' },
    { code: 'PHYS1010', name: 'Physics I', credits: 6, year: 1, sem: 'S2' },
    { code: 'ENGN1200', name: 'Materials & Manufacturing', credits: 12, year: 1, sem: 'S2' },
  ],
  BBUS: [
    { code: 'BUS1000', name: 'Principles of Management', credits: 12, year: 1, sem: 'S1' },
    { code: 'ECON1010', name: 'Microeconomics', credits: 6, year: 1, sem: 'S1' },
    { code: 'ACCT1000', name: 'Accounting Fundamentals', credits: 12, year: 1, sem: 'S2' },
    { code: 'MKTG1000', name: 'Marketing Principles', credits: 6, year: 1, sem: 'S2' },
  ],
  BSCI: [
    { code: 'SCIE1000', name: 'Scientific Inquiry', credits: 12, year: 1, sem: 'S1' },
    { code: 'CHEM1010', name: 'Chemistry I', credits: 6, year: 1, sem: 'S1' },
    { code: 'BIOL1010', name: 'Biology I', credits: 6, year: 1, sem: 'S2' },
    { code: 'PHYS1001', name: 'Physics for Scientists', credits: 12, year: 1, sem: 'S2' },
  ],
  LLB: [
    { code: 'LAWS1000', name: 'Foundations of Law', credits: 12, year: 1, sem: 'S1' },
    { code: 'LAWS1100', name: 'Legal Research & Writing', credits: 6, year: 1, sem: 'S1' },
    { code: 'LAWS1200', name: 'Criminal Law & Procedure', credits: 12, year: 1, sem: 'S2' },
    { code: 'LAWS1300', name: 'Contract Law', credits: 6, year: 1, sem: 'S2' },
  ],
  MCS: [
    { code: 'COMP6100', name: 'Advanced Algorithms', credits: 12, year: 1, sem: 'S1' },
    { code: 'COMP6200', name: 'Machine Learning', credits: 12, year: 1, sem: 'S1' },
    { code: 'COMP6300', name: 'Distributed Systems', credits: 12, year: 1, sem: 'S2' },
    { code: 'COMP6400', name: 'Computer Security', credits: 12, year: 1, sem: 'S2' },
  ],
  MBA: [
    { code: 'MBAX6010', name: 'Leadership & Strategy', credits: 12, year: 1, sem: 'S1' },
    { code: 'MBAX6020', name: 'Managerial Economics', credits: 12, year: 1, sem: 'S1' },
    { code: 'MBAX6030', name: 'Corporate Finance', credits: 12, year: 1, sem: 'S2' },
    { code: 'MBAX6040', name: 'Global Marketing', credits: 12, year: 1, sem: 'S2' },
  ],
  MPH: [
    { code: 'PUBH6010', name: 'Principles of Epidemiology', credits: 12, year: 1, sem: 'S1' },
    { code: 'PUBH6020', name: 'Health Policy & Systems', credits: 12, year: 1, sem: 'S1' },
    { code: 'PUBH6030', name: 'Biostatistics', credits: 12, year: 1, sem: 'S2' },
    { code: 'PUBH6040', name: 'Global Health', credits: 12, year: 1, sem: 'S2' },
  ],
  PHDCS: [
    { code: 'RESH9000', name: 'Research Methods & Ethics', credits: 12, year: 1, sem: 'S1' },
    { code: 'COMP9100', name: 'Advanced Research Topics in CS', credits: 12, year: 1, sem: 'S1' },
    { code: 'RESH9200', name: 'Thesis Proposal', credits: 12, year: 1, sem: 'S2' },
  ],
}

// 每个学习等级毕业所需学分
export const CREDITS_REQUIRED = {
  Undergraduate: 144,
  Postgraduate: 96,
  Research: 96,
}

// 授课老师名字池（seed 里按序取）
export const TEACHERS = [
  'Prof. Chen', 'Prof. Wang', 'Dr. Li', 'Prof. Zhang', 'Dr. Novak', 'Prof. Reyes',
  'Dr. Okafor', 'Prof. Müller', 'Dr. Santos', 'Prof. Ahmed', 'Dr. Ivanova', 'Prof. Kim',
]

// 当前学期（用于新生自动选课与演示学生的在读课程）
export const CURRENT_TERM = '2026 S1'
