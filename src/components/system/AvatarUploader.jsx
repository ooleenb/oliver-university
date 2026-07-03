import { useRef, useState } from 'react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../auth.jsx'
import Icon from '../Icon.jsx'

// 学生头像：显示当前头像（无则显示姓名首字母），点击可上传/更换。
export default function AvatarUploader({ size = 36, className = '' }) {
  const { user, refresh } = useAuth()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function onPick(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // 允许重复选择同一文件
    if (!file) return
    if (!file.type.startsWith('image/')) return setErr('Please choose an image file')
    if (file.size > 2 * 1024 * 1024) return setErr('Image must be under 2 MB')
    setErr('')
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await api.student.uploadAvatar(fd)
      await refresh() // 拉取带新 avatarUrl 的用户
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const initials = (user?.name || '?').slice(0, 2)

  return (
    <button
      type="button"
      onClick={() => !busy && inputRef.current?.click()}
      title="Change profile photo"
      style={{ width: size, height: size }}
      className={`group relative shrink-0 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-gold transition-all ${className}`}
    >
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="grid place-items-center w-full h-full bg-gold text-ink font-semibold text-sm uppercase">
          {initials}
        </span>
      )}

      {/* 悬停 / 上传中遮罩 */}
      <span
        className={`absolute inset-0 grid place-items-center bg-ink/55 text-white transition-opacity ${
          busy ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {busy ? (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : (
          <Icon name="upload" size={Math.max(14, size * 0.4)} />
        )}
      </span>

      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
      {err && (
        <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-red-600 px-2 py-1 text-[11px] font-normal text-white shadow-lg">
          {err}
        </span>
      )}
    </button>
  )
}
