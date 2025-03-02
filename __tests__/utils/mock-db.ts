export class MockDB {
  async prepare(query: string) {
    return {
      bind: (...params: any[]) => ({
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({ lastRowId: 1 })
      })
    };
  }

  async batch<T>(queries: string[]): Promise<T[]> {
    return [];
  }
}

// Export a mock DB instance to use in tests
export const mockDB = new MockDB();

// Mock the DB module
jest.mock('../../lib/db', () => ({
  DB: mockDB
})); 