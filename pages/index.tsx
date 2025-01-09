import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    // Hero section animation
    gsap.from('.hero-text', {
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 1,
      ease: 'power3.out'
    });
  }, []);

  return (
    <div className="text-center">
      <SignedOut>
        <div className="max-w-3xl mx-auto">
          <h1 className="hero-text text-4xl font-bold mb-4">
            Welcome to Your App
          </h1>
          <p className="hero-text text-xl text-gray-600 mb-8">
            Sign up to access exclusive features and content.
          </p>
          <div className="hero-text space-x-4">
            <Link
              href="/sign-up"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="max-w-3xl mx-auto">
          <h1 className="hero-text text-4xl font-bold mb-4">
            Welcome Back!
          </h1>
          <p className="hero-text text-xl text-gray-600">
            Check out your personalized dashboard and latest updates.
          </p>
        </div>
      </SignedIn>
    </div>
  );
} 