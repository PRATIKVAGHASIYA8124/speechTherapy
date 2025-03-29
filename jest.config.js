module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  setupFilesAfterEnv: ['./server/__tests__/setup.js'],
  testTimeout: 10000,
  detectOpenHandles: true
}; 