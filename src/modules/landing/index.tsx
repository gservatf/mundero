import React from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from './components/HeroSection';
import { ValueSection } from './components/ValueSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { IntegrationsSection } from './components/IntegrationsSection';

export const LandingPage: React.FC = () => {
  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white scroll-smooth transition-colors duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* HERO SECTION */}
      <section id="hero" className="scroll-mt-16">
        <HeroSection />
      </section>

      {/* VALUE SECTION */}
      <section id="value" className="scroll-mt-16">
        <ValueSection />
      </section>

      {/* INTEGRATIONS SECTION */}
      <section id="integrations" className="scroll-mt-16 bg-slate-50 dark:bg-slate-800 py-16">
        <IntegrationsSection />
      </section>

      {/* CTA SECTION */}
      <section id="cta" className="scroll-mt-16">
        <CTASection />
      </section>

      {/* FOOTER */}
      <footer id="footer" className="scroll-mt-16">
        <Footer />
      </footer>
    </motion.div>
  );
};

export default LandingPage;
