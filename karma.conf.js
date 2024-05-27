module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-input-masks/releases/angular-input-masks-standalone.js',
      'node_modules/ng-mask/dist/ngMask.min.js',
      'app/**/*.module.js',
      'app/**/*.js',
      'test/**/*.spec.js',
      'app/**/*.html',
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity,
    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
    ],
  })
}
