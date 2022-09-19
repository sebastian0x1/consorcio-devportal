export default {
  testEnvironment: 'node',
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: './__reports__/coverage',
  coveragePathIgnorePatterns: ['node_modules', 'database'],
  transform: {},
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporters',
      {
        filename: `${Date.now()}-tests-report.html`,
        publicPath: './__reports__/',
        pageTitle: `Tests Report`,
      },
    ],
  ],
  collectCoverage: true,
  collectCoverageFrom: ['./backend/**/*.js'],
  coverageDirectory: './__reports__/coverage',
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1,
    },
  },
}
