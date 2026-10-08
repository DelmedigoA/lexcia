import { useInView, useCountUp } from '@/hooks/useInView';
import { MessageCircle, Globe, Clock, TrendingUp } from 'lucide-react';

const stats = [
  { icon: MessageCircle, value: 500, suffix: 'M+', label: 'Conversations handled', color: 'text-primary-600', bg: 'bg-primary-50' },
  { icon: Globe, value: 95, suffix: '+', label: 'Languages supported', color: 'text-teal-600', bg: 'bg-teal-50' },
  { icon: Clock, value: 0.3, suffix: 's', label: 'Average response time', color: 'text-accent-600', bg: 'bg-accent-50', decimal: true },
  { icon: TrendingUp, value: 340, suffix: '%', label: 'Avg. engagement increase', color: 'text-success-600', bg: 'bg-success-50' },
];

function StatCard({ stat, start }: { stat: typeof stats[0] & { decimal?: boolean }, start: boolean }) {
  const count = useCountUp(stat.value, 2000, start);
  const display = stat.decimal ? (count / 10).toFixed(1) : count;

  return (
    <div className="text-center group">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${stat.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <stat.icon className={`w-6 h-6 ${stat.color}`} />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-ink-900 tracking-tight">
        {display}<span className="text-gradient">{stat.suffix}</span>
      </div>
      <p className="mt-2 text-sm text-ink-500 font-medium">{stat.label}</p>
    </div>
  );
}

export default function Stats() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="relative py-20 bg-white border-y border-ink-100 overflow-hidden">
      <div className="absolute inset-0 bg-grid-light opacity-40" />
      <div ref={ref} className="relative max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} start={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
