/*global module */
module.exports = function (config) {
    "use strict";
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'requirejs'],
        files: [
            'test/main-test.js',
            {pattern: 'bower_components/jquery/dist/jquery.js', included: false},
	        {pattern: 'bower_components/chai/chai.js', included: false},
	        {pattern: 'bower_components/chai-jquery/chai-jquery.js', included: false},
            {pattern: 'src/**/*.js', included: false},
            {pattern: 'test/**/*Tests.js', included: false}
        ],
        exclude: [ ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_DEBUG,
        autoWatch: false,
        browsers: ['PhantomJS'],
        singleRun: true
    });
};
