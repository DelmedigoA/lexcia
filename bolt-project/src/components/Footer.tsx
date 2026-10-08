import { Sparkles, Twitter, Linkedin, Github, Youtube } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Demo', 'Integrations', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Help Center', 'Community', 'Status'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'],
};

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-ink-100 pt-20 pb-10 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-4">
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-ink-900 tracking-tight">Lexica</span>
            </a>
            <p className="text-sm text-ink-500 leading-relaxed max-w-xs mb-6">
              The AI chatbot that makes any website interactive, engaging, and alive.
              Built for teams who care about every visitor.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-ink-50 border border-ink-100 flex items-center justify-center text-ink-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all"
                >
                  <social.icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-ink-900 mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-ink-500 hover:text-primary-600 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-y border-ink-100">
          <div>
            <p className="text-sm font-semibold text-ink-900">Stay in the loop</p>
            <p className="text-xs text-ink-500 mt-1">Product updates, tips, and AI insights. No spam.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-ink-50 border border-ink-200 text-sm text-ink-900 placeholder-ink-400 outline-none focus:border-primary-400 transition-colors"
            />
            <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-teal-500 text-white text-sm font-semibold whitespace-nowrap hover:scale-105 transition-transform shadow-lg shadow-primary-500/20">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
          <p className="text-xs text-ink-400">
            © 2026 Lexica Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-ink-400">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
