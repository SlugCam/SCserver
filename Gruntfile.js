module.exports = function(grunt) {

    //config: grunt.file.readJSON('config.json'),
    var config = require('./config');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,

        groc: {
            javascript: [
                "*.js", "servers/**/*.js", "testing/**/*.js", "util/**/*.js", "README.md"
            ],
            options: {
                "out": "_www/src/"
            }
        },

        shell: {
            mongodb: {
                command: 'mkdir -p <%= config.db.path %>; mongod --dbpath <%= config.db.path %> --port <%= config.db.port %>',
                options: {
                    async: false,
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        cwd: '.'
                    }
                }
            },
            watchTests: {
                command: 'mocha --compilers coffee:coffee-script/register -w -G',
                options: {
                    async: false,
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        cwd: '.'
                    }
                }
            }
        },
        mochaTest: {
            all: {
                options: {
                    reporter: 'spec',
                    require: 'coffee-script/register',
                    //growl: true
                },
                src: ['test/**/*.coffee']
            }
        }
    });

    grunt.loadNpmTasks('grunt-groc');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('start-servers', 'Start the SWEETnet servers.',
        function() {
            var messageServer = require('./servers/message_server');
            var apiServer = require('./servers/api_server');
            var videoServer = require('./servers/video_server');
            require('./servers/lib/db').setConfig(config);

            messageServer.listen(config.messageServer.port);
            messageServer.listen(config.messageServer.port);
            messageServer.listen(config.messageServer.port);
        });

    // Default task(s).
    grunt.registerTask('doc', 'Generate documentation.', ['groc']);
    grunt.registerTask('default', ['doc']);
    grunt.registerTask('db', 'Start the Mongo database.', ['shell:mongodb']);

    // db comes after, it will hold the process open because it is set to async,
    // kind of hacky, but it works for now.
    grunt.registerTask('start', 'Starts SWEETnet from the ground up.', ['start-servers', 'db']);

    grunt.registerTask('test-watch', 'Watch the mocha tests.', ['shell:watchTests']);
    grunt.registerTask('test', 'Run the mocha tests', ['mochaTest']);

};
