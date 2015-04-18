module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-devserver');
    grunt.initConfig({
        devserver: {
            server: {},
            options: {
                port: 8080,
                base: '.',
                async: true
            }
        },
        karma: { unit: { configFile: 'karma.conf.js' } },
        jshint: {
            'options': { jshintrc: '.jshintrc' },
            all: [
                '*.js',
                'src/**/*.js',
                'test/**/*.js'
            ]
        }
    });
    grunt.registerTask('default', [
        'jshint',
        'karma'
    ]);
    grunt.registerTask('dev', [
        'jshint',
        'karma',
        'devserver'
    ]);
};