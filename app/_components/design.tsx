'use client';

import React from 'react';
import { FaCloudUploadAlt, FaShieldAlt, FaBolt } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const Design = () => {
  const trustedLogos = [
    { src: 'https://logo.clearbit.com/google.com', alt: 'Google' },
    { src: 'https://logo.clearbit.com/netflix.com', alt: 'Netflix' },
    { src: 'https://logo.clearbit.com/slack.com', alt: 'Slack' },
    { src: 'https://logo.clearbit.com/microsoft.com', alt: 'Microsoft' },
  ];

  return (
    <section className="relative bg-gradient-to-b from-black to-gray-950 text-white py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-indigo-900/5 to-transparent -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 -z-10" />

      <div className="relative max-w-6xl mx-auto text-center z-10">
        <span className="text-blue-500 uppercase tracking-widest text-sm font-medium bg-blue-950/70 px-4 py-1 rounded-full">
          Next-Gen File Sharing
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold mt-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Secure File Transfer, Redefined
        </h1>

        <p className="text-gray-400 mt-6 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Darkdrop combines blazing-fast uploads with quantum-grade encryption, designed for creators, teams, and privacy-first users.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button className="px-8 py-6 text-lg bg-blue-700 hover:bg-blue-800 rounded-full transition-all duration-300 shadow-lg shadow-blue-900/30">
            Start Sharing Now
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 text-lg rounded-full border-blue-600 text-blue-400 hover:bg-blue-950/70 transition-all duration-300"
          >
            Explore Features
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-gray-950/90 backdrop-blur-sm border-gray-900 hover:border-blue-600/50 transition-all duration-300">
            <CardHeader>
              <FaCloudUploadAlt className="text-blue-500 text-4xl mb-2" />
              <CardTitle className="text-xl text-white">Rapid Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Lightning-fast transfers powered by optimized technology.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950/90 backdrop-blur-sm border-gray-900 hover:border-purple-600/50 transition-all duration-300">
            <CardHeader>
              <FaShieldAlt className="text-purple-500 text-4xl mb-2" />
              <CardTitle className="text-xl text-white">Quantum Encryption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Unbreakable security with next-level cryptography.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950/90 backdrop-blur-sm border-gray-900 hover:border-yellow-600/50 transition-all duration-300">
            <CardHeader>
              <FaBolt className="text-yellow-500 text-4xl mb-2" />
              <CardTitle className="text-xl text-white">Instant Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Seamless real-time sharing and team sync.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-20 max-w-xl mx-auto bg-gray-950/90 border-gray-900">
          <CardHeader>
            <CardTitle className="text-xl text-white">Live Upload Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-900/70 p-4 rounded-lg">
                <div>
                  <p className="text-white font-medium">design-system.fig</p>
                  <p className="text-gray-500 text-xs">Size: 24MB • AES-256 Secured</p>
                </div>
                <span className="bg-green-600/20 text-green-400 text-xs px-3 py-1 rounded-full animate-pulse">
                  75% Complete
                </span>
              </div>
              <Progress value={75} className="h-2 bg-gray-900" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-24">
          <p className="uppercase text-sm text-gray-500 tracking-widest mb-8">Trusted by Industry Leaders</p>
          <div className="flex justify-center flex-wrap gap-12 opacity-80">
            {trustedLogos.map((logo, index) => (
              <img
                key={index}
                src={logo.src}
                alt={logo.alt}
                className="h-8 hover:scale-110 transition-transform duration-300 brightness-75 hover:brightness-100"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Design;