// # Cam Bot

// Simulates network activity from a SWEETcam

var net = require('net');
var path = require('path');
var fs = require('fs');

// Constructor creates a bot with a link to the message server at serverHost
// on port serverPort. Note that serverHost will default to localhost.
function CamBot(config, name) {
    // Generates a name for this camera
    this.config = config;
    this.name = name;
    this.videoPort = config.videoServer.port;
    this.videoHostname = config.videoServer.hostname;
    this.messagePort = config.messageServer.port;
    this.messageHostname = config.messageServer.hostname;
}

// Format of protocol:
// - Camera Name (null terminated string)
// - Video ID (unsigned 32 int)
// - Video Length (unsigned 32 int)
// - Data
// This means we have a header that is the (length of string + 1) + 4 + 4 =
// (length of string) + 9 bytes long, followed by the data.
CamBot.prototype.sendVideo = function(filename) {
    filename = path.join(__dirname, 'test_files', filename);
    var camName = this.name;
    // net.connect port, hostname, listener for connect event
    console.log('Attempting to send video to ' + this.videoHostname + ':' + this.videoPort);
    var client = net.connect(this.videoPort, this.videoHostname, function() {
        console.log(camName + ': connected to video server');
        var header = new Buffer(camName.length + 9);
        var videobuffer = fs.readFileSync(filename);

        // Zero out this new buffer, so we don't worry about adding the null
        // byte after the string later (node doesn't guarantee an empty buffer)
        header.fill(0);
        header.write(camName, 'ascii');
        var cursor = camName.length + 1;
        header.writeUInt32BE(id, cursor);
        cursor += 4;
        header.writeUInt32BE(videobuffer.byteLength(), cursor);

        console.log(header);
        console.log(videobuffer);
        client.write(header);
        client.write(videobuffer);
        client.end();
    });

    client.on('data', function(data) {
        console.log(data.toString());
        client.end();
    });

    client.on('end', function() {
        console.log('client disconnected');
    });

};

CamBot.prototype.ping = function(count, delay) {
    var me = this;
    delay = delay || 5000;
    if (!count) return;
    this.send([{
        messageSender: this.name,
        messageType: 'ping',
        content: 'ping...'
    }]);

    setTimeout(function() {
        me.ping(count - 1, delay);
    }, delay);
};

// This function will send each object in the argument array to the server
// specified at bot creation time.
CamBot.prototype.send = function(objectArray) {
    // net.connect port, hostname, listener for connect event
    var client = net.connect(this.messagePort, this.messageHostname, function() {
        console.log(this.name + ': connected to message server');
        objectArray.forEach(function(val) {
            client.write(JSON.stringify(val) + '\r\n');
        });
    });
    client.on('data', function(data) {
        console.log(data.toString());
        client.end();
    });
    client.on('end', function() {
        console.log('client disconnected');
    });
};

module.exports = function(config) {
    var exports = {};

    exports.create = function(name) {
        return new CamBot(config, name);
    };

    return exports;
};
