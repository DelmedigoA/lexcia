import { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for personal sites and small projects',
    monthly: 19,
    yearly: 15,
    features: [
      '1 chatbot',
      '1,000 conversations / month',
      '10 languages',
      'Basic analytics',
      'Email support',
      'Custom branding',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    description: 'For growing businesses that need more power',
    monthly: 49,
    yearly: 39,
    features: [
      '3 chatbots',
      '10,000 conversations / month',
      '95+ languages',
      'Advanced analytics',
      'Priority support',
      'Smart handoff to humans',
      'Custom personality',
      'API access',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    description: 'Unlimited everything for large organizations',
    monthly: null,
    yearly: null,
    features: [
      'Unlimited chatbots',
      'Unlimited conversations',
      'All 95+ languages',
      'Custom analytics dashboard',
      'Dedicated account manager',
      'SSO & SAML',
      'On-premise option',
      'Custom SLA',
    ],
    highlight: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-dot-light opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-ink-50 border border-ink-200/60 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-ink-900 tracking-tight">
            Simple, transparent
            <span className="text-gradient"> pricing</span>
          </h2>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed">
            Start free for 14 days. No credit card required. Cancel anytime.
          </p>
        </Reveal>

        {/* Billing toggle */}
        <Reveal delay={100} className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-ink-900' : 'text-ink-400'}`}>Monthly</span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-14 h-7 rounded-full bg-ink-200 border border-ink-300 transition-colors"
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 shadow-md transition-all duration-300 ${yearly ? 'left-8' : 'left-1'}`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${yearly ? 'text-ink-900' : 'text-ink-400'}`}>
            Yearly
            <span className="ml-2 text-xs text-teal-600 font-semibold">Save 20%</span>
          </span>
        </Reveal>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, idx) => (
            <Reveal key={plan.name} delay={idx * 150}>
              <div
                className={`relative h-full p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? 'bg-white border-primary-300 shadow-elevated shadow-primary-500/10 lg:scale-105'
                    : 'bg-white border-ink-200 shadow-soft hover:shadow-elevated'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-teal-500 text-xs font-semibold text-white shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      Most Popular
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-bold text-ink-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed">{plan.description}</p>

                <div className="mt-6 mb-6">
                  {plan.monthly !== null ? (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-ink-900">${yearly ? plan.yearly : plan.monthly}</span>
                      <span className="text-sm text-ink-400 mb-1">/month</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-ink-900">Custom</div>
                  )}
                  {plan.monthly !== null && yearly && (
                    <p className="text-xs text-teal-600 mt-1 font-medium">Billed annually</p>
                  )}
                </div>

                <a
                  href="#"
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-primary-600 to-teal-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02]'
                      : 'bg-ink-900 text-white hover:bg-ink-800'
                  }`}
                >
                  {plan.monthly !== null ? 'Start Free Trial' : 'Contact Sales'}
                  <ArrowRight className="w-4 h-4" />
                </a>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-primary-100' : 'bg-teal-50'}`}>
                        <Check className={`w-3 h-3 ${plan.highlight ? 'text-primary-600' : 'text-teal-600'}`} />
                      </div>
                      <span className="text-sm text-ink-600">{feature}</span>
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
