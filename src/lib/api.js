// 前端 API 客户端：封装 fetch，自动附带 JWT，统一错误处理。
const TOKEN_KEY = 'oliver-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (isForm) {
    payload = body // FormData，浏览器自动设 Content-Type
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`/api${path}`, { method, headers, body: payload })
  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  return data
}

// 需要携带 JWT 的文件下载：拉成 blob 再触发浏览器保存（<a href> 无法带 Authorization 头）
async function download(path, filename) {
  const token = getToken()
  const res = await fetch(`/api${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) {
    let message = `Download failed (${res.status})`
    try {
      const d = await res.json()
      message = d.error || message
    } catch {
      /* 非 JSON 错误 */
    }
    throw new Error(message)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || ''
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  upload: (p, formData) => request(p, { method: 'POST', body: formData, isForm: true }),

  // 便捷分组
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    me: () => request('/auth/me'),
    setPassword: (password) => request('/auth/set-password', { method: 'POST', body: { password } }),
  },
  student: {
    summary: () => request('/student/summary'),
    courses: () => request('/student/courses'),
    grades: () => request('/student/grades'),
    timetable: () => request('/student/timetable'),
    uploadAvatar: (formData) => request('/student/avatar', { method: 'POST', body: formData, isForm: true }),
  },
  programs: {
    list: (params = '') => request(`/programs${params}`),
    get: (id) => request(`/programs/${id}`),
  },
  applications: {
    mine: () => request('/applications/mine'),
    all: (query = '') => request(`/applications${query}`),
    get: (id) => request(`/applications/${id}`),
    create: (programId) => request('/applications', { method: 'POST', body: { programId } }),
    update: (id, body) => request(`/applications/${id}`, { method: 'PATCH', body }),
    submit: (id) => request(`/applications/${id}/submit`, { method: 'POST' }),
    review: (id, body) => request(`/applications/${id}/review`, { method: 'POST', body }),
    decision: (id, body) => request(`/applications/${id}/decision`, { method: 'POST', body }),
    uploadDoc: (id, formData) => request(`/applications/${id}/documents`, { method: 'POST', body: formData, isForm: true }),
    downloadDoc: (id, docId, filename) => download(`/applications/${id}/documents/${docId}`, filename),
  },
  offers: {
    mine: () => request('/offers/mine'),
    accept: (id) => request(`/offers/${id}/accept`, { method: 'POST' }),
    decline: (id) => request(`/offers/${id}/decline`, { method: 'POST' }),
    letter: (id, filename = 'Offer_Oliver_University.pdf') => download(`/offers/${id}/letter`, filename),
  },
  geo: {
    auAddress: (q) => request(`/geo/au-address?q=${encodeURIComponent(q)}`),
  },
  notifications: {
    list: () => request('/notifications'),
    read: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
    readAll: () => request('/notifications/read-all', { method: 'POST' }),
  },
  admin: {
    users: (query = '') => request(`/admin/users${query}`),
    createUser: (body) => request('/admin/users', { method: 'POST', body }),
    updateUser: (id, body) => request(`/admin/users/${id}`, { method: 'PATCH', body }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    createProgram: (body) => request('/admin/programs', { method: 'POST', body }),
    updateProgram: (id, body) => request(`/admin/programs/${id}`, { method: 'PATCH', body }),
    deleteProgram: (id) => request(`/admin/programs/${id}`, { method: 'DELETE' }),
    stats: () => request('/admin/stats'),
    audit: () => request('/admin/audit'),
  },
}
