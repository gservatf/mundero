import React from 'react';
import { HeroSection } from './components/HeroSection';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <Footer />
    </div>
  );
};

export default LandingPage;