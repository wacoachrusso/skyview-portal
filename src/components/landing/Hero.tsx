import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="hero-section relative w-full min-h-screen bg-hero-gradient text-white overflow-hidden">
      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <h1 className="text-5xl font-bold">Welcome to SkyGuide</h1>
        <p className="mt-4 text-lg">Your trusted companion for contract interpretation.</p>
        <div className="mt-8">
          <Button variant="default">Get Started</Button>
        </div>
        <TypeAnimation
          sequence={[
            'Explore our features...',
            2000,
            'Get insights on contracts...',
            2000,
            'Join our community...',
            2000,
          ]}
          wrapper="h2"
          cursor={true}
          repeat={Infinity}
          className="mt-4 text-2xl"
        />
      </div>
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" aria-hidden="true" />
    </section>
  );
}