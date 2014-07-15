// # video_server.js

// This file contains the code for the SWEETnet video server. It is responsible
// for receiving and storing video from the cameras.

// Format of protocol:
// - Camera Name (null terminated string)
// - Video ID (unsigned 32 int)
// - Video Length (unsigned 32 int)
// - Data

module.exports = function(config) {
    var exports = {};

    // We use the Node.js `net` library to facilitate TCP communication.
    var net = require('net');
    var VideoProtocol = require('./lib/video_protocol').VideoProtocol;

    // This is our data store library. It contains the functions we use to store
    // videos to the database.
    // var db = require('./lib/db.js')(config);

    // Build a server object, `net.createServer` creates a server object and sets
    // the function to be the listener for the `connection` event. This function
    // receives as an argument a connection object which is an instance of
    // `net.Socket`.
    var server = net.createServer(function(c) { //'connection' listener
        console.log('video server connected');
        // TODO make sure the path exists
        c.pipe(new VideoProtocol(config.videoServer.path));

        // The data event is emitted when data is received.
        /*
        c.on('data', function(data) {
            //parse(data);
            //console.log(data);
        });
        */

        // The end event is emitted by the connection when the connection is
        // disconnected.
        /*
        c.on('end', function() {
            console.log('video server disconnected');
        });*/

        //c.write('hello\r\n');
    });

    // listen starts the server listening on the given port.
    exports.listen = function(port) {
        server.listen(port, function() {
            console.log('video server bound to port ' + port);
        });
    };

    exports.start = function() {
        server.listen(config.videoServer.port, function() {
            console.log('video server bound to port ' + config.videoServer.port);
        });
    };

    return exports;
};
