module.exports = function(grunt) {

    //config: grunt.file.readJSON('config.json'),
    var config = require('./config');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        groc: {
            javascript: [
                "*.js", "servers/**/*.js", "testing/**/*.js", "util/**/*.js", "README.md"
            ],
            options: {
                "out": "_www/src/"
            }
        },

        mongobin: {
            start: {
                task: 'mongod',
                port: config.db.port,
                dbpath: config.db.path
            },
        },

        mochaTest: {
            all: {
                options: {
                    reporter: 'spec',
                    require: [
                        'coffee-script/register',
                        'should'
                    ],
                },
                src: ['test/**/*.coffee']
            }
        },
    });

    grunt.loadNpmTasks('grunt-groc');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mongo-bin');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('start-servers', 'Start the SWEETnet servers.',
        function() {
            var messageServer = require('./servers/message_server');
            var apiServer = require('./servers/api_server');
            var videoServer = require('./servers/video_server');
            require('./servers/lib/db').setConfig(config);

            messageServer.listen(config.messageServer.port);
            apiServer.listen(config.apiServer.port);
            videoServer.listen(config.videoServer.port);

        });
    grunt.registerTask('db', 'Start the Mongo database.', ['mongobin:start']);

    // db comes after, it will hold the process open because it is set to async,
    // kind of hacky, but it works for now.
    grunt.registerTask('start', 'Starts SWEETnet from the ground up.', ['concurrent:startenv']);

    grunt.registerTask('doc', 'Generate documentation.', ['groc']);
    grunt.registerTask('test', 'Run the mocha tests', ['mochaTest']);

    grunt.registerTask('default', ['doc']);
};
