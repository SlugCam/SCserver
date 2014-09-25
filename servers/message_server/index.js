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


// We use the Node.js `net` library to facilitate TCP communication.
var net = require('net');
var fs = require('fs');

// This is our data store library. It contains the functions we use to store
// messages to the database.
var db = require('../lib/db.js');

// This is our custom JSON stream parser.
var JSONParseStream = require('./json_parse_stream').JSONParseStream;
var log;

// Build a server object, `net.createServer` creates a server object and sets
// the function to be the listener for the `connection` event. This function
// receives as an argument a connection object which is an instance of
// `net.Socket`.
var server = net.createServer(function(c) { // 'connection' listener
    log.info('server connected');
    c.pipe(new JSONParseStream())
        .on('data', function(data) {
            log.info('object received');
            log.trace(data);
            // TODO throw error if no time
            if (data.time) {
                data.time = new Date(data.time * 1000);
            }
            db.storeMessage(data);

            // Send test ack, should be on callback from db
            var ack = JSON.stringify({
                id: 0,
                time: Math.floor((new Date()).getTime() / 1000),
                type: 'ack',
                data: null,
                ack: [data.id]
            }) + '\r\n';

            c.write(ack);
            log.trace(ack);
        });
    //c.pipe(fs.createWriteStream('incoming.log'));

    // The end event is emitted by the connection when the connection is
    // disconnected.
    c.on('end', function() {
        log.info('server disconnected');
    });

});


// listen starts the server listening on the given port.
exports.listen = function(port, logger) {
    if (!logger) {
        console.error('message_server: requires a log object');
        return;
    }
    log = logger;
    server.listen(port, function() {
        log.info('server bound to port ' + port);
    });
};

