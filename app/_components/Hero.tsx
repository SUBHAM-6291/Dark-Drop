'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Inter, Merriweather } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['700', '500'],
  display: 'swap',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const Hero = () => {
  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
      <Image
        src="/images/header1st.jpg"
        alt="Subtle noise texture background"
        fill
        className="opacity-5 -z-10 object-cover"
        priority={false}
        quality={75}
        sizes="100vw"
      />
      <div className="flex flex-col md:flex-row items-center w-full max-w-7xl">
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative">
          <Image
            src="/images/header1st.jpg"
            alt="Professional woman working in modern office"
            fill
            className="object-cover object-center opacity-80"
            priority
            quality={80}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="w-full md:w-1/2 text-center md:text-left px-8 py-12 z-10">
          <h1
            className={cn(
              inter.className,
              'text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent'
            )}
          >
            The Future of File Sharing Is Here
          </h1>

          <p
            className={cn(
              merriweather.className,
              'text-lg md:text-xl text-gray-400 mb-10 leading-relaxed'
            )}
          >
            Darkdrop delivers unmatched speed, ironclad security, and effortless collaboration—all wrapped in a sleek, dark interface.
          </p>

          <Button
            type="button"
            className={cn(
              inter.className,
              'bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-10 py-4',
              'hover:from-blue-800 hover:to-indigo-900 transition-all duration-300',
              'text-base font-medium rounded-full shadow-lg shadow-blue-900/30'
            )}
          >
            Start Sharing Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;