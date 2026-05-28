export default {
  testEnvironment: 'node',
  transform: {},
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'repositories/**/*.js'
  ],
  testMatch: [
    '**/test/coreTeamController.test.js',
    '**/test/eventsController.test.js'
  ],
  // Ignore frontend or external files
  testPathIgnorePatterns: ['/node_modules/']
};
