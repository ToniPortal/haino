// jest.config.js

module.exports = {
  projects: [
    {
      displayName: 'Node',
      testMatch: ['<rootDir>/test/jest/**/*.node.test.js'],
      testEnvironment: 'node',
    },
    {
      displayName: 'JavaScript',
      testMatch: ['<rootDir>/test/jest/**/*.js.test.js', '!<rootDir>/test/jest/**/*.node.test.js'],
      testEnvironment: 'jsdom',
    },
  ],
};
