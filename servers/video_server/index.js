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
var VideoProtocolModule = require('./video_protocol');
var VideoProtocol = VideoProtocolModule.VideoProtocol;

var log, videoPath;

// This is our data store library. It contains the functions we use to store
// videos to the database.
var db = require('../lib/db.js');

// Build a server object, `net.createServer` creates a server object and sets
// the function to be the listener for the `connection` event. This function
// receives as an argument a connection object which is an instance of
// `net.Socket`.
var server = net.createServer(function(c) { //'connection' listener
    log.info('server connected');

    var videoWriter = new VideoProtocol();
    videoWriter.events.on('videoReceived', function(camName, vidId) {
        log.info('Video', vidId, 'received from', camName);
        // Write ack, mark db
        db.setVideoUploaded(camName, vidId);
	c.write(vidId + '\r');
    });
    c.pipe(videoWriter);

    c.on('end', function() {
        // TODO clean up?
        log.info('server disconnected');
    });

});

// listen starts the server listening on the given port.
exports.listen = function(port, logger, videoDataPath) {
    if (!port || !logger || !videoDataPath) {
        throw ('video_server.listen: called with incorrect arguments.');
    }
    videoPath = videoDataPath;
    log = logger;
    VideoProtocolModule.configure(videoPath, log);
    server.listen(port, function() {
        log.info('server bound to port ' + port);
    });
};
