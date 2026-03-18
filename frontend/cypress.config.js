module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1200,
    viewportHeight: 800,
    screenshotOnRunFailure: true,
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
};
