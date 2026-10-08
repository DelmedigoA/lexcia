import {
  MessageSquare, Brain, Globe, BarChart3, Shield, Plug, Zap, Languages,
} from 'lucide-react';
import Reveal from './Reveal';

const features = [
  {
    icon: Brain,
    title: 'Context-Aware AI',
    description: 'Lexica reads your website content and learns your business. It answers with precision, not generic guesses.',
    color: 'from-primary-500 to-primary-700',
    bg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Speak to every visitor in their language. Lexica auto-detects and responds in 95+ languages natively.',
    color: 'from-teal-500 to-teal-700',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Zap,
    title: 'Instant Responses',
    description: 'Sub-second reply times powered by edge computing. No waiting, no spinning loaders — just answers.',
    color: 'from-accent-400 to-accent-600',
    bg: 'bg-accent-50',
    iconColor: 'text-accent-600',
  },
  {
    icon: BarChart3,
    title: 'Conversation Analytics',
    description: 'Track every interaction. See what visitors ask, where they drop off, and what drives conversions.',
    color: 'from-success-500 to-success-700',
    bg: 'bg-success-50',
    iconColor: 'text-success-600',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II, GDPR, and HIPAA compliant. Your data and your customers\' data stay protected.',
    color: 'from-primary-600 to-teal-600',
    bg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    icon: Plug,
    title: 'One-Click Integration',
    description: 'Paste a single line of code. Lexica works on any platform — WordPress, Shopify, React, or custom.',
    color: 'from-teal-500 to-primary-600',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: MessageSquare,
    title: 'Smart Handoff',
    description: 'When a conversation needs a human, Lexica seamlessly routes to your team with full context attached.',
    color: 'from-primary-500 to-teal-600',
    bg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    icon: Languages,
    title: 'Custom Personality',
    description: 'Match your brand voice. Lexica can be professional, playful, or anything in between — you decide.',
    color: 'from-success-500 to-teal-500',
    bg: 'bg-success-50',
    iconColor: 'text-success-600',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32 bg-ink-50 overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary-200/20 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[350px] h-[350px] bg-teal-200/20 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white shadow-soft border border-ink-200/60 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-ink-900 tracking-tight">
            Everything you need to
            <span className="text-gradient"> engage every visitor</span>
          </h2>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed">
            Lexica comes packed with powerful AI capabilities designed to make your
            website not just interactive, but genuinely helpful.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => (
            <Reveal key={feature.title} delay={idx * 80}>
              <div className="group h-full p-6 rounded-2xl bg-white border border-ink-100 shadow-soft hover:shadow-elevated hover:border-primary-200 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-ink-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
