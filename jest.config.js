// jest.config.js

module.exports = {
  projects: [
    {
      displayName: 'Node',
      testMatch: ['<rootDir>/test/**/*.node.test.js'],
      testEnvironment: 'node',
    },
    {
      displayName: 'JavaScript',
      testMatch: ['<rootDir>/test/**/*.js.test.js', '!<rootDir>/test/**/*.node.test.js'],
      testEnvironment: 'jsdom',
    },
  ],
};
