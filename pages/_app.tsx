import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import Layout from '../components/Layout';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ClerkProvider>
  );
} 