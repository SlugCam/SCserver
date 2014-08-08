// db.js
// =====
//
// This file contains the data store API. This can be used by all the servers
// to help isolate database specific code from the server protocol 
// implementation.
//
// Currently this library uses mongo through the mongoskin library.

var db;
var log;

exports.setConfig = function(config, logger) {
    dbPath = 'mongodb://' + config.db.hostname + ':' + config.db.port;
    db = require('mongoskin').db(dbPath + '/SWEETnet');
    log = logger;
};


// Message Functions
// -----------------

// TODO success/failure callback and verification of input
exports.storeMessage = function(message) {
    // Check if camera is registered
    db.collection('mstore').insert(message, function(err, result) {
        if (err) throw err;
        if (result) log.trace('message store successful');
    });
};

// Returns an array of all messages
exports.getMessages = function(cb) {
    db.collection('mstore').find().toArray(function(err, result) {
        if (err) throw err;
        log.trace('get messages success');
        cb(result);
    });
};

// Camera Functions
// ----------------

exports.getCameras = function(cb) {
    db.collection('stages').toArray(function(err, result) {
        if (err) throw err;
        cb(result);
    });
};

// Video Functions
// ---------------

// Callback takes an error message if error and count of updated as per mongodb
// specs
exports.setVideoUploaded = function(camName, vidId, callback) {
    db.collection('videos').update({
        cam: camName,
        id: vidId
    }, {
        $set: {
            videoUploaded: true
        }
    }, {
        upsert: true
    }, function(err, count) {
        if (callback) {
            callback(err, count);
        } else {
            if (err) {
                log.error('error marking video as uploaded', err);
            } else {
                log.info(camName + '/' + vidId.toString() + ' set as uploaded');
            }
        }
    });
};

// Used by API server
exports.getUploadedVideos = function(callback) {
    db.collection('videos').find({
        videoUploaded: true
    }).toArray(function(err, result) {
        if (err) throw err;
        log.trace('get uploaded videos success');
        callback(result);
    });
};
