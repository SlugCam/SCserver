// start.js
// ========
//
// The main start script for SWEETnet.

// Imports
// -------
require('shelljs/global');

var config = require('./config'),
    messageServer = require('./servers/message_server'),
    apiServer = require('./servers/api_server'),
    videoServer = require('./servers/video_server'),
    bunyan = require('bunyan'),
    serveStatic = require('serve-static'),
    bunyanMiddleware = require('bunyan-middleware'),
    connect = require('connect');

// Script
// ------

// Make the data directories if they do not exist.
mkdir('-p', config.videoServer.path);
mkdir('-p', config.db.path);

// ### Database Setup
//
// Start the database.
exec('mongod --dbpath ' + config.db.path + ' --port ' + config.db.port, {
    async: true,
    silent: true
});

// Set the configuration in the database model module. This will carry over to 
// the rest of the modules as each future reference to the database module will
// return the same object as per node Node specs. (each call to require returns
// the cached object not a new one)
require('./servers/lib/db').setConfig(config, bunyan.createLogger({
    name: "dataLib",
    level: "trace"
}));

// ### Start the servers
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


// ### Serve the Web App
var staticLog = bunyan.createLogger({
    name: 'appServer'
});

var app = connect();
app.use(function(req, res, next) {
    staticLog.trace('[%s] "%s %s" "%s"', (new Date()).toUTCString(), req.method, req.url, req.headers['user-agent']);
    res.on('finish', function() {
        staticLog.trace('response finish');
    });
    next();
});

app.use(serveStatic('webapp/app', {
    'index': ['index.html', 'index.htm']
}));
app.listen(8000);
staticLog.info('server bound to port ' + 8000);
