import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';
import { MockDB } from './__tests__/utils/mock-db.ts';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set up environment variables
process.env.JWT_SECRET = 'test_secret';

// Set up global DB mock
global.DB = new MockDB();
