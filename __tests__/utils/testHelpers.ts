import { NextApiRequest, NextApiResponse } from 'next';

// Create a mock D1 database
const mockDB = {
  prepare: () => ({
    bind: () => ({
      all: async () => ({ results: [] }),
      first: async () => null,
      run: async () => ({ lastRowId: 1 })
    })
  }),
  batch: async () => []
};

// Set global DB
global.DB = mockDB;

export function createMockRequest(overrides = {}) {
  return {
    method: 'GET',
    headers: {},
    cookies: {},
    body: {},
    query: {},
    ...overrides
  } as NextApiRequest;
}

export function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as NextApiResponse;
}

export { mockDB }; 