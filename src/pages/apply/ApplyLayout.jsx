import AppLayout from '../../components/system/AppLayout.jsx'
import NotificationsBell from '../../components/system/NotificationsBell.jsx'

const menu = [
  { to: '/apply', label: 'Overview', icon: 'home', end: true },
  { to: '/apply/programs', label: 'Browse Programs', icon: 'compass' },
  { to: '/apply/offers', label: 'My Offers', icon: 'file' },
]

export default function ApplyLayout() {
  return <AppLayout menu={menu} subtitle="Admissions Portal" topRight={<NotificationsBell />} />
}
