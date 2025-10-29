import React from 'react';
import { HeroSection } from './components/HeroSection';
import { ValueSection } from './components/ValueSection';
import { IntegrationsSection } from './components/IntegrationsSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ValueSection />
      <IntegrationsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;