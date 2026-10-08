import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Logos from '@/components/Logos';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import ChatDemo from '@/components/ChatDemo';
import Stats from '@/components/Stats';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main>
        <Hero />
        <Logos />
        <Features />
        <HowItWorks />
        <ChatDemo />
        <Stats />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
