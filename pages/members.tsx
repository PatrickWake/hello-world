import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function Members() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    // Content animation
    gsap.from('.content-item', {
      opacity: 0,
      y: 20,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, []);

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="content-item text-3xl font-bold mb-8">Members Area</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="content-item bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <p className="text-gray-600">
            Access your personal information and settings.
          </p>
        </div>
        <div className="content-item bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Member Benefits</h2>
          <p className="text-gray-600">
            Explore exclusive features available to members.
          </p>
        </div>
      </div>
    </div>
  );
} 