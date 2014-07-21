// api_server.js
// =============
//
// Contains the server for the external facing http server that application
// programmers can interface with.

var http = require('http');
var url = require('url');
var db = require('./lib/db');

routes = {};

var server = http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    console.log('api server: request for ' + uri);
    if (routes[uri]) {
        // http://www.ietf.org/rfc/rfc4627.txt
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
        });

        routes[uri](function(object) {
            res.end(JSON.stringify(object));
        });
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/html'
        });
        res.end('<h1>404: Resource not found</h1>');
    }
});

routes['/dump'] = db.getMessages;
routes['/cameras'] = db.getCameras;

// Starts the server on the port number of the argument
exports.listen = function(port) {
    server.listen(port, function() {
        console.log('api server bound to port ' + port);
    });
};

// Starts the server on the port number given by the configuration file
exports.start = function() {
    server.listen(config.apiServer.port, function() {
        console.log('api server bound to port ' + config.apiServer.port);
    });
};
