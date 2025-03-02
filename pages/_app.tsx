import React from 'react';
import { AuthProvider } from '../lib/auth/AuthContext';
import { NotificationProvider } from '../lib/notifications/NotificationContext';
import Layout from '../components/Layout';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
} 