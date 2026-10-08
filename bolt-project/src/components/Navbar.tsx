import { useEffect, useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Reviews', href: '#testimonials' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-ink-200/60 py-3 shadow-soft'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-ink-900 tracking-tight">Lexica</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-teal-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a href="#" className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors">
            Sign In
          </a>
          <a
            href="#pricing"
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-500 hover:to-teal-400 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105"
          >
            Get Started
          </a>
        </div>

        <button
          className="md:hidden text-ink-800 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden mt-4 mx-6 glass-white rounded-2xl p-6 shadow-elevated animate-scale-in origin-top">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-ink-200 my-2" />
            <a href="#" className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors">
              Sign In
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-teal-500 text-center"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
