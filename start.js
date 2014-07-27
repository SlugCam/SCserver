require('shelljs/global');

var config = require('./config'),
    messageServer = require('./servers/message_server'),
    apiServer = require('./servers/api_server'),
    videoServer = require('./servers/video_server'),
    bunyan = require('bunyan'),
    serveStatic = require('serve-static'),
    finalhandler = require('finalhandler'),
    http = require('http');

exec('mongod --dbpath ' + config.db.path + ' --port ' + config.db.port, {
    async: true,
    silent: true
});

require('./servers/lib/db').setConfig(config, bunyan.createLogger({
    name: "dataLib",
    level: "trace"
}));

mkdir('-p', config.videoServer.path);
mkdir('-p', config.db.path);

messageServer.listen(config.messageServer.port, bunyan.createLogger({
    name: 'messageServer',
    level: "trace"
}));

apiServer.listen(config.apiServer.port, bunyan.createLogger({
    name: 'apiServer',
    level: "trace"
}));

videoServer.listen(config.videoServer.port, bunyan.createLogger({
    name: 'videoServer',
    level: "trace"
}));


// Serve up public/ftp folder
var serve = serveStatic('webapp/app', {'index': ['index.html', 'index.htm']});

// Create server
var server = http.createServer(function(req, res){
  var done = finalhandler(req, res);
  serve(req, res, done);
});

// Listen
server.listen(8000);
