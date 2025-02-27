import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  // The test environment that will be used for testing
  testEnvironment: "jsdom",
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: [ "<rootDir>/**/*.{js,jsx,ts,tsx}" ],
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "<rootDir>/coverage",
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Adjust based on your project structure
    "uuid": require.resolve('uuid'),
  },
  testPathIgnorePatterns: [
    '<rootDir>/packages/',
    '<rootDir>/components/MoleculeOrder/__tests__/MoleculeOrder.test.tsx'
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)