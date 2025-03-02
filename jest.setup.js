import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set up environment variables
process.env.JWT_SECRET = 'test_secret';

// Import mock DB setup
import './utils/mock-db';
