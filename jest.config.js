const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^lib/(.*)$': '<rootDir>/lib/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(jose)/)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
}

module.exports = createJestConfig(customJestConfig) 