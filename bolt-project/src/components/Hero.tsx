import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Bot, User, Check, Zap, Star } from 'lucide-react';

const conversationSteps = [
  { role: 'bot', text: "Hi! I'm Lexica. How can I help you today?" },
  { role: 'user', text: "I'm looking for a pair of running shoes, size 10." },
  { role: 'bot', text: "Great choice! I found 3 options in size 10. The CloudRunner X is our bestseller — want to see it?" },
  { role: 'user', text: "Yes, and do you ship to Boston?" },
  { role: 'bot', text: "Absolutely! Free 2-day shipping to Boston. Want me to add the CloudRunner X to your cart?" },
];

export default function Hero() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (visibleMessages >= conversationSteps.length) {
      const resetTimer = setTimeout(() => setVisibleMessages(0), 5000);
      return () => clearTimeout(resetTimer);
    }

    const isBot = conversationSteps[visibleMessages]?.role === 'bot';
    const delay = isBot ? 1200 : 800;

    setTyping(true);
    const typingTimer = setTimeout(() => {
      setTyping(false);
      setVisibleMessages((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(typingTimer);
  }, [visibleMessages]);

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden bg-gradient-to-b from-ink-50 via-white to-ink-50">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-light opacity-60" />
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary-300/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-teal-300/20 rounded-full blur-[100px] animate-float-slow" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
        {/* Left: Content */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-soft border border-ink-200/60 mb-6 animate-fade-in-down">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
            </span>
            <span className="text-xs font-medium text-ink-700">Now with GPT-4o powered responses</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-ink-900 leading-[1.05] tracking-tight animate-fade-in-up">
            Make your website
            <br />
            <span className="text-gradient">come alive</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-ink-600 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            Lexica is an AI chatbot that turns any website into an interactive,
            conversational experience. Answer questions, guide users, and convert
            visitors — 24/7.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <a
              href="#pricing"
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-500 text-white font-semibold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white text-ink-800 font-semibold border border-ink-200 shadow-soft hover:border-primary-300 hover:shadow-glow transition-all"
            >
              <Sparkles className="w-5 h-5 text-primary-500" />
              See It Live
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            {['No code required', '5-minute setup', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-ink-600 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat preview */}
        <div className="relative animate-scale-in" style={{ animationDelay: '200ms' }}>
          {/* Floating accent cards */}
          <div className="absolute -top-5 -left-5 glass-card rounded-2xl p-4 z-20 animate-float hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-ink-500">Response time</p>
                <p className="text-sm font-bold text-ink-900">0.3s avg</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -right-5 glass-card rounded-2xl p-4 z-20 animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-600 fill-primary-500" />
              </div>
              <div>
                <p className="text-xs text-ink-500">Engagement</p>
                <p className="text-sm font-bold text-ink-900">+340%</p>
              </div>
            </div>
          </div>

          {/* Chat window */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-elevated border border-ink-200/50">
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
                  <p className="text-xs text-success-600 font-medium">Online now</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-ink-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-ink-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-ink-200" />
              </div>
            </div>

            {/* Messages */}
            <div className="px-5 py-6 space-y-4 min-h-[380px] max-h-[380px] overflow-hidden bg-ink-50/30">
              {conversationSteps.slice(0, visibleMessages).map((msg, idx) => (
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

              {typing && visibleMessages < conversationSteps.length && (
                <div className={`flex ${conversationSteps[visibleMessages].role === 'bot' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                  {conversationSteps[visibleMessages].role === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center mr-2.5 flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="px-4 py-3 rounded-2xl bg-white border border-ink-200/50 shadow-soft flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="px-5 py-4 border-t border-ink-100 bg-white">
              <div className="flex items-center gap-3 bg-ink-50 rounded-xl px-4 py-3 border border-ink-200/50">
                <span className="text-sm text-ink-400 flex-1">Type a message...</span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block">
        <div className="w-6 h-10 rounded-full border-2 border-ink-300 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-scroll-down" />
        </div>
      </div>
    </section>
  );
}
