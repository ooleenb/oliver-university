import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, setToken, getToken } from './lib/api.js'

// 真实鉴权：token 存 localStorage，用户信息来自后端。
const AuthContext = createContext(null)

// 各角色登录后的默认落地页
export const HOME_BY_ROLE = {
  applicant: '/apply',
  student: '/portal',
  admissions: '/admissions',
  admin: '/admin',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 启动时若有 token，拉取当前用户
  useEffect(() => {
    let alive = true
    async function boot() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const { user } = await api.auth.me()
        if (alive) setUser(user)
      } catch {
        setToken(null)
      } finally {
        if (alive) setLoading(false)
      }
    }
    boot()
    return () => {
      alive = false
    }
  }, [])

  async function login(email, password) {
    const { token, user } = await api.auth.login(email, password)
    setToken(token)
    setUser(user)
    return user
  }

  async function register(payload) {
    const { token, user } = await api.auth.register(payload)
    setToken(token)
    setUser(user)
    return user
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  // 供接受 offer 等场景刷新角色
  async function refresh() {
    const { user } = await api.auth.me()
    setUser(user)
    return user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// 需要登录（可选限定角色）
export function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-grey-600">
        <span className="animate-pulse">Loading…</span>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (roles && !roles.includes(user.role)) {
    // 角色不匹配 → 送回该角色自己的首页
    return <Navigate to={HOME_BY_ROLE[user.role] || '/'} replace />
  }
  return children
}
