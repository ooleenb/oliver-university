import AppLayout from '../../components/system/AppLayout.jsx'
import NotificationsBell from '../../components/system/NotificationsBell.jsx'

const menu = [
  { to: '/admissions', label: 'Applications', icon: 'inbox', end: true },
]

export default function AdmissionsLayout() {
  return <AppLayout menu={menu} subtitle="Admissions Office" topRight={<NotificationsBell />} />
}
