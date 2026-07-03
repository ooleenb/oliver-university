import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader.jsx'
import SiteFooter from './SiteFooter.jsx'

export default function PortalLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
