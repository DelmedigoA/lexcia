const logos = [
  'ShopFlow', 'MediCare', 'FinEdge', 'CloudPeak', 'NovaDesk', 'BrightPath', 'Quantix', 'Verda',
];

export default function Logos() {
  return (
    <section className="relative py-16 bg-white border-y border-ink-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-medium text-ink-400 mb-8 uppercase tracking-wider">
          Trusted by 12,000+ teams worldwide
        </p>
        <div className="relative">
          <div className="flex overflow-hidden">
            <div className="flex gap-16 animate-marquee items-center shrink-0">
              {logos.map((logo) => (
                <div key={logo} className="text-2xl font-bold text-ink-300 hover:text-ink-600 transition-colors whitespace-nowrap">
                  {logo}
                </div>
              ))}
            </div>
            <div className="flex gap-16 animate-marquee items-center shrink-0" aria-hidden="true">
              {logos.map((logo) => (
                <div key={logo} className="text-2xl font-bold text-ink-300 hover:text-ink-600 transition-colors whitespace-nowrap">
                  {logo}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
