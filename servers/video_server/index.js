// video_server.js
// ===============
//
// This file contains the code for the SWEETnet video server. It is responsible
// for receiving and storing video from the cameras.
//
// Format of protocol:
//
// - Camera Name (null terminated string)
// - Video ID (unsigned 32 int)
// - Video Length (unsigned 32 int)
// - Data


// We use the Node.js `net` library to facilitate TCP communication.
var net = require('net');
var VideoProtocol = require('./video_protocol').VideoProtocol;
var log;
var videoPath;

// This is our data store library. It contains the functions we use to store
// videos to the database.
// var db = require('./lib/db.js');

// Build a server object, `net.createServer` creates a server object and sets
// the function to be the listener for the `connection` event. This function
// receives as an argument a connection object which is an instance of
// `net.Socket`.
var server = net.createServer(function(c) { //'connection' listener
    log.info('server connected');

    // TODO make sure the path exists
    c.pipe(new VideoProtocol(videoPath));

    c.on('end', function() {
        log.info('server disconnected');
    });

});

// listen starts the server listening on the given port.
exports.listen = function(port, logger, videoDataPath) {
    videoPath = videoDataPath;
    if (!logger) {
        console.error('video_server: requires a log object');
        return;
    }
    log = logger;
    server.listen(port, function() {
        log.info('server bound to port ' + port);
    });
};

