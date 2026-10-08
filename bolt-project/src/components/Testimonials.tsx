import { Star, Quote } from 'lucide-react';
import Reveal from './Reveal';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Product',
    company: 'ShopFlow',
    avatar: 'SC',
    color: 'from-primary-500 to-teal-500',
    rating: 5,
    text: "Lexica transformed our storefront. Customer questions that used to pile up in support tickets now get answered instantly. Our conversion rate jumped 28% in the first month.",
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Founder & CEO',
    company: 'FinEdge',
    avatar: 'MR',
    color: 'from-teal-500 to-success-500',
    rating: 5,
    text: "We embedded Lexica on our landing page and within a week it was handling 90% of visitor questions. The analytics dashboard alone is worth the price — we finally know what people are actually asking.",
  },
  {
    name: 'Priya Patel',
    role: 'Customer Success Lead',
    company: 'NovaDesk',
    avatar: 'PP',
    color: 'from-success-500 to-accent-500',
    rating: 5,
    text: "Setup took literally four minutes. I'm not technical and I had Lexica running on our help center before my coffee got cold. The multilingual support is a game-changer for our global users.",
  },
  {
    name: 'James O\'Sullivan',
    role: 'Marketing Director',
    company: 'BrightPath',
    avatar: 'JO',
    color: 'from-accent-500 to-primary-600',
    rating: 5,
    text: "Our bounce rate dropped from 62% to 34%. Visitors stay because Lexica gives them a reason to engage. It's like having a 24/7 sales rep who never sleeps and knows everything about our product.",
  },
  {
    name: 'Aisha Bakari',
    role: 'CTO',
    company: 'Quantix',
    avatar: 'AB',
    color: 'from-primary-600 to-teal-600',
    rating: 5,
    text: "The handoff to human agents is seamless. Lexica collects context, summarizes the conversation, and routes it perfectly. Our support team's response quality went through the roof.",
  },
  {
    name: 'Tom Walker',
    role: 'Operations Manager',
    company: 'Verda',
    avatar: 'TW',
    color: 'from-teal-600 to-primary-600',
    rating: 5,
    text: "We replaced three different tools with Lexica. The ROI was immediate. What used to take our team 40 hours a week now takes 4, and customers are happier with the instant responses.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 lg:py-32 bg-ink-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-200/20 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white shadow-soft border border-ink-200/60 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-ink-900 tracking-tight">
            Loved by teams
            <span className="text-gradient"> everywhere</span>
          </h2>
          <div className="mt-5 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent-400 fill-accent-400" />
              ))}
            </div>
            <span className="text-sm text-ink-500 font-medium">4.9/5 from 2,800+ reviews</span>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((testimonial, idx) => (
            <Reveal key={testimonial.name} delay={idx * 80}>
              <div className="group h-full p-6 rounded-2xl bg-white border border-ink-100 shadow-soft hover:shadow-elevated hover:border-primary-200 transition-all duration-300 hover:-translate-y-1">
                <Quote className="w-8 h-8 text-primary-200 mb-4" />
                <p className="text-sm text-ink-700 leading-relaxed mb-5">{testimonial.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-ink-100">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-sm font-bold text-white shadow-md`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{testimonial.name}</p>
                    <p className="text-xs text-ink-500">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
