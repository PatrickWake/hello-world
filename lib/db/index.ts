import type { D1Database } from '@cloudflare/workers-types';

// Get the database from environment or create a mock for development
const getDatabase = (): D1Database => {
  // In a real environment, this would come from Cloudflare Workers bindings
  // For local development, we'll create a mock or use a local instance
  if (process.env.NODE_ENV === 'development') {
    // Return a mock D1Database for development
    return {
      prepare: () => ({
        bind: () => ({
          all: async () => [],
          first: async () => null,
          run: async () => ({ success: true }),
        }),
      }),
      exec: async () => ({ results: [] }),
      batch: async () => [{ results: [] }],
      dump: async () => new Uint8Array(),
    } as unknown as D1Database;
  }
  
  // In production, this would be provided by Cloudflare
  // This is a placeholder that should be replaced with actual implementation
  return ((global as any).DB || {}) as D1Database;
};

// Export a singleton instance of the database
export const DB = getDatabase();

// Export a function to get a fresh database connection if needed
export const getDB = getDatabase; 