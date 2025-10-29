import React from 'react';
import { HeroSection } from './components/HeroSection';
import { ValueSection } from './components/ValueSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ValueSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;