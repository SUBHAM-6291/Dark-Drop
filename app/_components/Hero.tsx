'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Hero = () => {
  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 -z-10" />
      <div className="flex items-center w-full max-w-7xl">
        <div className="w-1/2 h-screen hidden md:block">
          <img
            src="header1st.jpg"
            alt="Professional woman in office"
            className="w-full h-full object-cover object-center opacity-80"
            style={{ maxWidth: '100%', maxHeight: '100vh' }}
          // Fallback image
          />
        </div>

        <div className="w-full md:w-1/2 text-center md:text-left px-8 py-12 z-10">
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            The Future of File Sharing Is Here
          </h1>

          <p
            className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Darkdrop delivers unmatched speed, ironclad security, and effortless collaboration—all wrapped in a sleek, dark interface.
          </p>

          <Button
            className={cn(
              'bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-10 py-4',
              'hover:from-blue-800 hover:to-indigo-900 transition-all duration-300',
              'text-base font-medium rounded-full shadow-lg shadow-blue-900/30'
            )}
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Start Sharing Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;