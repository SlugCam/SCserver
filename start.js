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
    // Node Libraries
    fs = require('fs'),
    // Libraries
    argv = require('minimist')(process.argv.slice(2)), // parse argv using minimist
    bunyan = require('bunyan'),
    serveStatic = require('serve-static'),
    connect = require('connect');

// Message
// -------
console.log('Note, this start script also starts a static server for the angular app.');
console.log('To build the app go to the app directory and run `grunt build`.');

// Script
// ------

// Make the data directories if they do not exist.
mkdir('-p', config.videoServer.path);
mkdir('-p', config.db.path);
if (argv['save-logs']) {
    mkdir('-p', './_logs');
}

// ### Database Setup
//
// Start the database.
var dbproc = exec('mongod --dbpath ' + config.db.path + ' --port ' + config.db.port, {
    async: true,
    silent: true
});
if (argv['save-logs']) {
    var dbLog = fs.createWriteStream('./_logs/db.log', {
        flags: 'a'
    });
    dbproc.stdout.pipe(dbLog);
}

// ### SWEETnet Modules

// `sweetLog(name)` is a simple function that creates a bunyan logger and
// returns it. We use this function to create settings across all of the
// loggers.
function sweetLog(name) {
    var config = {
        name: name,
        streams: [{
            level: 'trace',
            stream: process.stdout // log INFO and above to stdout
        }, ]
    };
    if (argv['save-logs']) {
        config.streams.push({
            level: 'trace',
            path: './_logs/SWEETnet.log' // log to a file
        });
    }
    var myLog = bunyan.createLogger(config);
    return myLog;
}

// Set the configuration in the database model module. This will carry over to 
// the rest of the modules as each future reference to the database module will
// return the same object as per node Node specs. (each call to require returns
// the cached object not a new one)
require('./servers/lib/db').setConfig(config, sweetLog('dataLib'));

// ### Start the servers
messageServer.listen(config.messageServer.port, sweetLog('messageServer'));
apiServer.listen(config.apiServer.port, sweetLog('apiServer'), config.videoServer.path);
videoServer.listen(config.videoServer.port, sweetLog('videoServer'), config.videoServer.path);

// ### Serve the web app

// To serve the web app we just create a simple static server using the connect
// library that points at the root of the application code
var staticLog = sweetLog('appServer');

var app = connect();
app.use(function(req, res, next) {
    staticLog.trace('%s %s "%s"', req.method, req.url, req.headers['user-agent']);
    res.on('finish', function() {
        staticLog.trace('response finish');
    });
    next();
});

app.use(serveStatic('app/dist', {
    'index': ['index.html', 'index.htm']
}));
app.listen(8000);
staticLog.info('server bound to port ' + 8000);
