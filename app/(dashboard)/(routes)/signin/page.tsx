'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { z } from "zod";
import { USER_ZOD } from "@/app/Backend/zod/UserModel.zod";

const SignInPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    setIsSubmitting(true);

    try {
      USER_ZOD.parse({ name, email, password });

      setTimeout(() => {
        setIsSubmitting(false);
        toast.success('Sign-in successful! Welcome back to Darkdrop.');
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setIsSubmitting(false);
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
        } else {
          toast.error('Please enter valid details. Contact admin at subhamsingh39621@gmail.com if issues persist.');
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Toaster position="top-right" />

      <div className="w-full max-w-md bg-black border border-gray-800 rounded-xl p-8 shadow-xl shadow-gray-900/60">
        {}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-md flex items-center justify-center border border-gray-700">
              <span className="text-white text-xl font-bold">D</span>
            </div>
            <Link href="/" className="text-white text-2xl font-semibold hover:text-gray-300 transition-colors duration-300">
              Darkdrop
            </Link>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Access the World’s Fastest File-Saving App
          </p>
        </div>

        {}
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Sign In
        </h2>

        {}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-sm font-medium">
              Name
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30 rounded-md transition-all duration-300"
              placeholder="Enter name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30 rounded-md transition-all duration-300"
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30 rounded-md transition-all duration-300"
              placeholder="Enter password"
            />
          </div>

          <Button
            onClick={handleSignIn}
            disabled={isSubmitting}
            className="w-full bg-white text-black font-semibold rounded-md hover:bg-gray-100 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>

        {}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-300">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-4 w-full bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-white/50 hover:scale-105 rounded-md transition-all duration-300 ease-in-out"
          >
            <svg className="mr-2 h-‒ w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.22 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
        </div>

        {}
        <p className="mt-4 text-center text-sm text-gray-300">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-white hover:text-gray-200 hover:underline transition-colors duration-200">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;