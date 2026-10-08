import { useEffect, useRef, useState } from 'react';
import { Bot, User, Send, Sparkles, ShoppingBag, Headphones, BookOpen, Briefcase } from 'lucide-react';
import Reveal from './Reveal';

type Message = {
  role: 'bot' | 'user';
  text: string;
};

const scenarios = [
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    icon: ShoppingBag,
    messages: [
      { role: 'user' as const, text: "Do you have these shoes in blue?" },
      { role: 'bot' as const, text: "Yes! The CloudRunner X is available in navy blue. It's currently in stock in sizes 7-12. Would you like me to check a specific size?" },
      { role: 'user' as const, text: "Size 10 please" },
      { role: 'bot' as const, text: "Size 10 in navy is in stock — $129 with free 2-day shipping. Shall I add it to your cart?" },
    ],
  },
  {
    id: 'support',
    label: 'Customer Support',
    icon: Headphones,
    messages: [
      { role: 'user' as const, text: "How do I reset my password?" },
      { role: 'bot' as const, text: "I can help with that! Go to Settings > Security > Reset Password, and we'll email you a secure link. Want me to send the reset email now?" },
      { role: 'user' as const, text: "Yes please" },
      { role: 'bot' as const, text: "Done! Check your inbox for the reset link. It expires in 30 minutes for security. Anything else I can help with?" },
    ],
  },
  {
    id: 'saas',
    label: 'SaaS Onboarding',
    icon: Briefcase,
    messages: [
      { role: 'user' as const, text: "What plan should I pick for a team of 5?" },
      { role: 'bot' as const, text: "For a team of 5, the Pro plan is ideal — it includes 10 seats, advanced analytics, and priority support at $49/month. Shall I start a 14-day free trial?" },
      { role: 'user' as const, text: "Can I upgrade later?" },
      { role: 'bot' as const, text: "Absolutely! You can upgrade or downgrade anytime — changes are prorated automatically. No contracts, cancel whenever." },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    icon: BookOpen,
    messages: [
      { role: 'user' as const, text: "When does the next cohort start?" },
      { role: 'bot' as const, text: "Our next UX Design cohort starts November 4th. Early bird pricing is available until October 20th — 20% off! Want me to reserve your spot?" },
      { role: 'user' as const, text: "What are the prerequisites?" },
      { role: 'bot' as const, text: "Just basic design familiarity! We'll cover everything from research to prototyping. 12 weeks, live sessions twice a week, and a real client project." },
    ],
  },
];

export default function ChatDemo() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const playScenario = (scenarioIdx: number) => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setMessages([]);
    setTyping(false);

    const scenario = scenarios[scenarioIdx];
    let delay = 400;

    scenario.messages.forEach((msg) => {
      const isBot = msg.role === 'bot';
      const typeTime = isBot ? 1400 : 900;

      const typingTimeout = setTimeout(() => setTyping(true), delay);
      timeoutsRef.current.push(typingTimeout);

      const msgTimeout = setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, msg]);
      }, delay + typeTime);

      timeoutsRef.current.push(msgTimeout);
      delay += typeTime + 600;
    });
  };

  useEffect(() => {
    playScenario(activeScenario);
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [activeScenario]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTyping(true);

    const responses = [
      "Great question! Let me look into that for you.",
      "I'd be happy to help with that. Here's what I found...",
      "Based on your site's content, here's what I can tell you.",
    ];

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: 'bot', text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 1400);
  };

  return (
    <section id="demo" className="relative py-24 lg:py-32 bg-ink-50 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary-100/30 rounded-full blur-[150px]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white shadow-soft border border-ink-200/60 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-4">
            Live Demo
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-ink-900 tracking-tight">
            See Lexica in
            <span className="text-gradient"> action</span>
          </h2>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed">
            Pick a scenario and watch how Lexica handles real conversations. Try
            typing your own message too.
          </p>
        </Reveal>

        {/* Scenario tabs */}
        <Reveal delay={100} className="flex flex-wrap justify-center gap-3 mb-8">
          {scenarios.map((scenario, idx) => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenario(idx)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeScenario === idx
                  ? 'bg-gradient-to-r from-primary-600 to-teal-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white text-ink-600 border border-ink-200 shadow-soft hover:border-primary-300 hover:text-ink-900'
              }`}
            >
              <scenario.icon className="w-4 h-4" />
              {scenario.label}
            </button>
          ))}
        </Reveal>

        {/* Chat window */}
        <Reveal delay={200}>
          <div className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden shadow-elevated border border-ink-200/50">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 bg-gradient-to-r from-primary-50/50 to-teal-50/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success-500 border-2 border-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Lexica Assistant</p>
                  <p className="text-xs text-success-600 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3" />
                    {scenarios[activeScenario].label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => playScenario(activeScenario)}
                className="text-xs text-ink-500 hover:text-ink-900 transition-colors px-3 py-1.5 rounded-lg bg-white border border-ink-200 shadow-soft hover:border-primary-300"
              >
                Replay
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="px-5 py-6 space-y-4 h-[400px] overflow-y-auto scroll-smooth bg-ink-50/30">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center mr-2.5 flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md shadow-md shadow-primary-500/20'
                        : 'bg-white text-ink-800 rounded-bl-md border border-ink-200/50 shadow-soft'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-ink-200 flex items-center justify-center ml-2.5 flex-shrink-0">
                      <User className="w-4 h-4 text-ink-500" />
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center mr-2.5 flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-ink-200/50 shadow-soft flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-ink-100 bg-white">
              <div className="flex items-center gap-3 bg-ink-50 rounded-xl px-4 py-3 border border-ink-200/50 focus-within:border-primary-400 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-ink-900 placeholder-ink-400 outline-none"
                />
                <button
                  onClick={handleSend}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
