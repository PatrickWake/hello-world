import type { D1Database } from '@cloudflare/workers-types';

export class MockDB implements D1Database {
  async prepare(query: string) {
    return {
      bind: (...params: any[]) => ({
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({ lastRowId: 1 })
      })
    };
  }

  async batch<T>(statements: string[]): Promise<T[]> {
    return [];
  }

  async exec(query: string): Promise<void> {
    return;
  }
}

export const mockDB = new MockDB();

// No need to mock the DB module here since we're setting it in jest.setup.js 