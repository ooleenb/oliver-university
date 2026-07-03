import AppLayout from '../../components/system/AppLayout.jsx'
import NotificationsBell from '../../components/system/NotificationsBell.jsx'

const menu = [
  { to: '/admin', label: 'Dashboard', icon: 'chart', end: true },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/programs', label: 'Programs', icon: 'building' },
  { to: '/admin/audit', label: 'Audit log', icon: 'shield' },
]

export default function AdminLayout() {
  return <AppLayout menu={menu} subtitle="Administration" topRight={<NotificationsBell />} />
}
