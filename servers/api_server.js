// api_server.js
// =============
//
// Contains the server for the external facing http server that application
// programmers can interface with.
//
// References:
//
// - Pagination technique: http://blog.mongodirector.com/implementing-pagination-with-mongodb-express-js-slush/
//

//var http = require('http');
var url = require('url');
var db = require('./lib/db');
var log = null;
var path = require('path');
var bodyParser = require('body-parser');

var express = require('express');
var app = express();

// Run on all requests
app.use(function(req, res, next) {
    var uri = url.parse(req.url).pathname;
    log.info('request for ' + uri);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();

});

app.use(bodyParser.json({type:'*/json'}));


// Routes
// ------

app.get('/messages', function(req, res) {
    var options = {};

    options.page = req.query.page || 1,
    options.size = req.query.size || 20;

    db.getMessages(options, function(data) {
        res.json(data);
    });
});

app.get('/videos', function(req, res) {
    db.getUploadedVideos(function(data) {
        res.json(data);
    });
});

// ### Camera Routes

app.get('/cameras', function(req, res) {
    db.getCameras(function(data) {
        res.json(data);
    });
});

app.get('/cameras/:name', function(req, res) {
    db.getCamera(req.params.name, function (data) {
        res.json(data);
    });
});

app.post('/cameras/:name', function(req, res) {
    log.info('update camera with', req.body);
    db.updateCamera(req.params.name, req.body, function(error) {
        //TODO should transmit error
        res.end();
    });
});

/*
app.use('/media', function(req, res, next) {
    if (req.query.download) {

    }
    next();
});
*/


// Starts the server on the port number of the argument
exports.listen = function(port, logger, videoFolder) {
    if (!port || !videoFolder || !logger) {
        throw 'api_server.listen: incorrect ';
    }
    log = logger;
    // Must be done when we know the folder
    app.use('/media', express.static(path.join(videoFolder, 'vids'), {
        //          setHeaders: function (res) { res.setHeader('Content-Disposition', 'attachment'); }
    }));

    log.info('server bound to port ' + port);
    app.listen(port);
};
