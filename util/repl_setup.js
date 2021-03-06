// # repl_setup.js
//
// Sets up the context for the repl. Remember that this file will be loaded
// and evaluated into the repl.js script at the project root, so all module
// paths are relative to the project root.

var fs = require('fs');
var config = require('./config');
var bot = require('./test/lib/cam_bot')(config);
var messageServer = require('./servers/message_server');
var apiServer = require('./servers/api_server');
var videoServer = require('./servers/video_server');
var log = require('bunyan').createLogger({name: "repl"});

require('./servers/lib/db').setConfig(config);

var b1 = bot.create('b1');
var b2 = bot.create('b2');
var b3 = bot.create('b3');
var b4 = bot.create('b4');

messageServer.start = function () {
    this.listen(config.messageServer.port, log);
};

videoServer.start = function () {
    this.listen(config.videoServer.port, log);
};

apiServer.start = function () {
    this.listen(config.apiServer.port, log);
};
