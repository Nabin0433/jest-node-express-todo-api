module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,   // Enable coverage collection
    coverageDirectory: 'coverage',  // Directory to output coverage reports
    coverageThreshold: {   // Optional: set coverage thresholds (fail the test if not met)
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    collectCoverageFrom: [
      'controller/**/*.{ts,js}',
      'server.ts',
    ],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/prisma/',
      'database.ts',
    ],
    reporters: [
        "default",
        ["jest-html-reporter", {
          pageTitle: "Test Report",
          outputPath: "coverage/report.html"
        }]
      ]
  };
  