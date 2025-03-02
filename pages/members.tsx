import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth/AuthContext';

export default function Members() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>Members Area</h1>
      <p>Welcome {user.name || user.email}</p>
    </div>
  );
} 