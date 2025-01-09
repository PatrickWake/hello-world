import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // GSAP animation for page load
    gsap.from('main', {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: 'power3.out'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold">Your App</span>
              </Link>
            </div>
            <div className="flex items-center">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link 
                  href="/sign-in"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2"
                >
                  Sign in
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Sign up
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 