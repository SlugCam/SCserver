// message_server.js
// =================
//
// This file contains the code for the SWEETnet message server. It is
// responsible for coordinating message communication with the cameras. It is
// the only way to send messages to the cameras, and receives all non-video
// communication from the cameras. Logically it connects the cameras to the
// database.

// ## TODO
// The server will take JSON, one message object per line. JSON strings should
// be newline escapes (todo check this). Make sure that the data event is
// emitted after every newline.

module.exports = function(config) {
    var exports = {};

    // We use the Node.js `net` library to facilitate TCP communication.
    var net = require('net');

    // This is our data store library. It contains the functions we use to store
    // messages to the database.
    var db = require('./lib/db.js')(config);

    // Build a server object, `net.createServer` creates a server object and sets
    // the function to be the listener for the `connection` event. This function
    // receives as an argument a connection object which is an instance of
    // `net.Socket`.
    var server = net.createServer(function(c) { //'connection' listener
        console.log('message server connected');

        // The end event is emitted by the connection when the connection is
        // disconnected.
        c.on('end', function() {
            console.log('message server disconnected');
        });

        // The data event is emitted when data is received.
        c.on('data', function(data) {
            console.log(JSON.parse(data));
            db.storeMessage(JSON.parse(data));

            // If this is the first message retrieved, find camera name and start
            // sending pending messages.
        });

        c.write('hello\r\n');
    });

    // listen starts the server listening on the given port.
    exports.listen = function(port) {
        server.listen(port, function() {
            console.log('message server bound to port ' + port);
        });
    };

    exports.start = function() {
        server.listen(config.messageServer.port, function() {
            console.log('message server bound to port ' + config.messageServer.port);
        });
    };

    return exports;
};
