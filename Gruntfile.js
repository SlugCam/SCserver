module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),

        groc: {
            javascript: [
                "*/*.js", "README.md"
            ],
            options: {
                "out": "doc/"
            }
        },

        shell: {
            mongodb: {
                command: 'mkdir -p ./data/db; mongod --dbpath ./data/db --port <%= config.db.port %>',
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
    });

    grunt.loadNpmTasks('grunt-groc');
    grunt.loadNpmTasks('grunt-shell-spawn');

    // Default task(s).
    grunt.registerTask('doc', 'Generate documentation.', ['groc']);
    grunt.registerTask('default', ['doc']);
    grunt.registerTask('db', 'Start the Mongo database.', ['shell:mongodb']);


};
