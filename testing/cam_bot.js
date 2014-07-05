// # Cam Bot

// Simulates network activity from a SWEETcam

var net = require('net');

// Constructor creates a bot with a link to the message server at serverHost
// on port serverPort. Note that serverHost will default to localhost.
function CamBot(config, name) {
    // Generates a name for this camera
    this.name = name;
    this.port = config.messageServer.port;
    this.hostname = config.messageServer.hostname;
}

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
    var client = net.connect(this.port, this.hostname, function() {
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
