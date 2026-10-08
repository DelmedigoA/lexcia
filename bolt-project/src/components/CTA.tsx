import { ArrowRight, Sparkles } from 'lucide-react';
import Reveal from './Reveal';

export default function CTA() {
  return (
    <section className="relative py-24 lg:py-32 bg-ink-50 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[120px]" />

      <div className="relative max-w-4xl mx-auto px-6">
        <Reveal>
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-teal-600 rounded-[2.5rem] p-12 md:p-16 text-center overflow-hidden shadow-elevated">
            {/* Decorative elements */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-grid-light opacity-10" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xs font-medium text-white">14-day free trial</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                Ready to make your
                <br />
                website <span className="text-teal-200">come alive?</span>
              </h2>

              <p className="mt-6 text-lg text-primary-100 max-w-xl mx-auto leading-relaxed">
                Join 12,000+ teams using Lexica to turn passive visitors into engaged
                conversations. Set up in minutes. No credit card required.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#pricing"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary-700 font-semibold shadow-xl hover:scale-105 transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-semibold border border-white/30 hover:bg-white/20 transition-all"
                >
                  Book a Demo
                </a>
              </div>

              <p className="mt-8 text-xs text-primary-200">
                No credit card required · Cancel anytime · 5-minute setup
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
