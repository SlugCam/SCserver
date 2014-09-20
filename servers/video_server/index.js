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

var ffmpeg = require('fluent-ffmpeg');

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
    videoWriter.events.on('videoReceived', function(info) {
        // convert add logger TODO
        log.info('video', info.id, 'received from', info.cam);
        // Write ack, mark db
        try {
            c.write(info.id + '\r');
        } catch (e) {
            log.error('error in sending ack for video', e);
        }

        db.setVideoUploaded(info.cam, info.id);

        var command = ffmpeg(info.path + '.avi', {
                logger: log
            })
            .videoCodec('libx264')
            .noAudio()
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);
            })
            .on('end', function() {
                log.info('Processing finished !');

                ffmpeg.ffprobe(info.path + '.mp4', function(err, metadata) {
                    if (err) {
                    } else {
                        var startTime = new Date(info.id * 1000);
                        var duration = metadata.streams[0].duration;
                        var endTime = new Date((info.id + duration) * 1000)

                        db.setVideoConverted(info.cam, info.id, startTime, endTime);
                        log.info('duration detected for video ' + info.id + ': ' + duration);
                    }
                });
            })
            .save(info.path + '.mp4');

        // TODO should be more robust

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
