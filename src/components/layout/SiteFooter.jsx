import { Link } from 'react-router-dom'
import { university } from '../../data/mock.js'

const footerLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Careers', to: '/contact' },
  { label: 'Safety & Respect', to: '/contact#emergency' },
  { label: 'News Center', to: '/news' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Campus Locations', to: '/contact' },
]

const social = ['X', 'Facebook', 'LinkedIn', 'Instagram', 'Tiktok']

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white/80 mt-auto">
      {/* 原住民致辞（借鉴两校 Acknowledgement of Country 的做法，此处本地化为校训区块） */}
      <div className="border-b border-white/10">
        <div className="container-page py-10">
          <h2 className="font-serif text-xl text-white mb-3">Our Commitment</h2>
          <p className="max-w-2xl text-sm leading-relaxed">
            Oliver University is committed to being a hub for ideas and a community of problem-solvers. We value the diversity of knowledge and believe that education can bring lasting change to individuals, communities, and the world.
          </p>
        </div>
      </div>

      <div className="container-page py-10 grid gap-8 md:grid-cols-3">
        {/* 链接 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="grid grid-cols-2 gap-y-2 text-sm">
            {footerLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 联系 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Information</h3>
          <p className="text-sm leading-relaxed">
            Phone: +61 433 961 229 <br />
            Address: 1 University Avenue<br />
            Oliverton Campus
          </p>
        </div>

        {/* 社交 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Follow Us</h3>
          <ul className="flex flex-wrap gap-2">
            {social.map((s) => (
              <li key={s}>
                <a
                  href="#"
                  className="grid place-items-center px-3 h-9 rounded bg-white/10 text-xs hover:bg-white/20 transition-colors"
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/60">
          <p>© 2026 {university.name} · Official</p>
          <ul className="flex gap-5">
            <li><Link to="/about" className="hover:text-white">Terms &amp; Privacy</Link></li>
            <li><Link to="/about" className="hover:text-white">Accessibility</Link></li>
            <li><Link to="/contact#emergency" className="hover:text-white">Emergency</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
