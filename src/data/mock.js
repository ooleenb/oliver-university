// Site-wide mock data — replace with API calls when wiring a backend.

export const university = {
  name: 'Oliver University',
  motto: 'Seek Your Potential',
  founded: 'MDCCCLXXXV', // 1885 in Roman numerals
  tagline: 'A network of free thoughts',
}

// Top utility navigation
export const utilityNav = [
  { label: 'Library', to: '/about#library' },
  { label: 'Current Students', to: '/login' },
  { label: 'Staff', to: '/login' },
  { label: 'Events', to: '/news#events' },
  { label: 'Give', to: '/about#give' },
  { label: 'Contact', to: '/contact' },
]

// Main navigation
export const mainNav = [
  { label: 'Study', to: '/courses' },
  { label: 'Research', to: '/about#research' },
  { label: 'Engage', to: '/about#engage' },
  { label: 'About', to: '/about' },
  { label: 'News', to: '/news' },
]

// Study areas (icon grid) — q 会作为课程检索的关键词
export const studyAreas = [
  { title: 'Architecture, Design & Planning', icon: 'compass', q: 'Architecture' },
  { title: 'Arts & Social Sciences', icon: 'bulb', q: 'Arts' },
  { title: 'Business', icon: 'handshake', q: 'Business' },
  { title: 'Economics', icon: 'chart', q: 'Economics' },
  { title: 'Education & Social Work', icon: 'book', q: 'Education' },
  { title: 'Engineering & Computer Science', icon: 'gear', q: 'Engineering' },
  { title: 'Law', icon: 'gavel', q: 'Law' },
  { title: 'Medicine & Health', icon: 'heart', q: 'Health' },
  { title: 'Music', icon: 'note', q: 'Music' },
  { title: 'Science', icon: 'atom', q: 'Science' },
]

// Study levels — level 用于按层级筛选（空 = 全部）
export const studyLevels = [
  { title: 'Undergraduate', desc: 'Flexible degrees and a global network', icon: 'book', level: 'Undergraduate' },
  { title: 'Postgraduate', desc: 'Cutting-edge programs with industry links', icon: 'chart', level: 'Postgraduate' },
  { title: 'Research Degrees', desc: 'Tackle big questions with world-class experts', icon: 'bulb', level: 'Research' },
  { title: 'Short Courses', desc: 'Career development and skill building', icon: 'gear', level: '' },
]

// Rankings and stats
export const stats = [
  { value: '#1', text: 'Nationally for overall reputation¹' },
  { value: '#22', text: 'In the world university rankings²' },
  { value: '#1', text: 'Nationally for graduate employability³' },
]

// News — id 作为文章路由 /news/:id，body 为正文段落
export const news = [
  {
    id: 'architecture-investment',
    tag: 'Research',
    title: '$74M investment boosts the School of Architecture & Design',
    desc: 'A major foundation gift will create a global hub for architecture and design education.',
    img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=70',
    date: 'Jun 28, 2026',
    author: 'Oliver University Newsroom',
    featured: true,
    body: [
      'A landmark $74 million gift from the Oliver Foundation will transform the School of Architecture & Design into a global hub for sustainable design education and research.',
      'The investment funds new studios, a fabrication laboratory, and 20 fully-funded scholarships for students from under-represented backgrounds. Construction on the new facilities begins next year.',
      '“This is a generational opportunity to reimagine how we teach design,” said the Dean of the faculty. “Our students will graduate ready to shape more liveable, sustainable cities.”',
    ],
  },
  {
    id: 'global-rankings',
    tag: 'Education',
    title: 'Oliver University places 10 subjects in the global top 25',
    desc: 'In the latest subject rankings, 10 of our subjects rank in the world top 25 and 31 in the top 50.',
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=70',
    date: 'Jun 20, 2026',
    author: 'Office of the Provost',
    body: [
      'Oliver University has cemented its position among the world’s leading institutions, with 10 subjects now ranked in the global top 25 and 31 in the top 50.',
      'Computer Science, Law and Public Health recorded the strongest gains, reflecting sustained investment in teaching quality and research impact.',
      'The results place Oliver University consistently among the top universities nationally for both academic reputation and graduate employability.',
    ],
  },
  {
    id: 'science-gallery-exhibition',
    tag: 'Community',
    title: 'New exhibition explores adaptation in an age of change',
    desc: 'The Science Gallery launches a free exhibition inviting visitors to imagine how we connect and care in a fast-changing world.',
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=70',
    date: 'Jun 12, 2026',
    author: 'Science Gallery',
    body: [
      'A free new exhibition at the Science Gallery invites visitors to explore how humans, technology and the natural world adapt in an age of rapid change.',
      'Featuring installations from artists and researchers across the university, the exhibition runs through the end of the year and is open to the public seven days a week.',
      'Interactive workshops for schools and families will run throughout the season — booking is recommended.',
    ],
  },
]

// Campus events
export const events = [
  { date: 'Jul 4 · 18:00', type: 'Public Lecture', title: 'America: The Sacred and the Secular' },
  { date: 'Jul 8 · 12:00', type: 'Public Lecture', title: 'Then and Now: A Few Things I Learned About Health' },
  { date: 'Jul 27 · 13:00', type: 'Exhibition', title: 'Rethinking Grainger: New Perspectives from the Collection' },
]

// 注：学生端（课程/课表/成绩/通知）已改为后端真实数据，见 src/pages/system/* 与 /api/student/*。
