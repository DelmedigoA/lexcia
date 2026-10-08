import { Code2, Wand2, Rocket } from 'lucide-react';
import Reveal from './Reveal';

const steps = [
  {
    number: '01',
    icon: Wand2,
    title: 'Train Lexica',
    description: 'Enter your website URL. Lexica automatically crawls and learns your content, FAQs, and products in minutes.',
    accent: 'from-primary-500 to-primary-700',
    bg: 'bg-primary-50',
    iconColor: 'text-primary-600',
    points: ['Auto-crawls your site', 'Learns your brand voice', 'No manual data entry'],
  },
  {
    number: '02',
    icon: Code2,
    title: 'Embed the Widget',
    description: 'Copy one line of JavaScript and paste it into your site. Lexica instantly appears as a floating chat bubble.',
    accent: 'from-teal-500 to-teal-700',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    points: ['Single line of code', 'Works on any platform', 'Customizable appearance'],
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Go Live',
    description: 'Your website is now alive. Lexica handles questions, guides visitors, and captures leads around the clock.',
    accent: 'from-accent-400 to-accent-600',
    bg: 'bg-accent-50',
    iconColor: 'text-accent-600',
    points: ['24/7 availability', 'Real-time analytics', 'Continuous learning'],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-dot-light opacity-40" />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-ink-50 border border-ink-200/60 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-ink-900 tracking-tight">
            Up and running in
            <span className="text-gradient"> under 5 minutes</span>
          </h2>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed">
            No engineering team required. No complex setup. Just three simple steps
            between you and an interactive website.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-20 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-primary-300/50 via-teal-300/50 to-accent-300/50" />

          {steps.map((step, idx) => (
            <Reveal key={step.number} delay={idx * 200} className="relative">
              <div className="flex flex-col items-center text-center">
                {/* Icon circle */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 rounded-2xl ${step.bg} flex items-center justify-center shadow-soft relative z-10 border border-white`}>
                    <step.icon className={`w-9 h-9 ${step.iconColor}`} />
                  </div>
                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br ${step.accent} flex items-center justify-center text-xs font-bold text-white z-20 shadow-lg`}>
                    {idx + 1}
                  </div>
                </div>

                <span className="text-5xl font-bold text-ink-100 mb-2">{step.number}</span>
                <h3 className="text-xl font-bold text-ink-900 mb-3">{step.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed max-w-xs mb-5">{step.description}</p>

                <div className="space-y-2">
                  {step.points.map((point) => (
                    <div key={point} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.accent}`} />
                      <span className="text-xs text-ink-600 font-medium">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
