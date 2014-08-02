// api_server.js
// =============
//
// Contains the server for the external facing http server that application
// programmers can interface with.

//var http = require('http');
var url = require('url');
var db = require('./lib/db');
var log = null;

var express = require('express');
var app = express();

app.use(function(req, res, next) {
    var uri = url.parse(req.url).pathname;
    log.info('request for ' + uri);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.get('/dump', function(req, res) {
    db.getMessages(function (data) {
        res.json(data);
    });
    //res.send('hello world');
});

// Starts the server on the port number of the argument
exports.listen = function(port, logger) {
    if (!logger) {
        console.error('api_server: requires a log object');
        return;
    }
    log = logger;
    log.info('server bound to port ' + port);
    app.listen(port);
};
/*
routes = {};

var server = http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    log.info('request for ' + uri);
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
exports.listen = function(port, logger) {
    if (!logger) {
        console.error('api_server: requires a log object');
        return;
    }
    log = logger;
    server.listen(port, function() {
        log.info('server bound to port ' + port);
    });
};
*/
