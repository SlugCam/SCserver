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
// TODO check callback
exports.storeMessage = function(message, callback) {
    // Check if camera is registered

    db.collection('mstore').insert(message, function(err, result) {
        if (callback) {
            callback(err);
        } else {
            if (err) {
                log.error('message not stored: ', err);

            } else {
                log.trace('message store successful');
            }
        }
    });

    if (message.cam) {
        // Track last message time
        db.collection('cameras').update({
            name: message.cam,
        }, {
            $currentDate: {
                lastMessage: true
            }
        }, {
            upsert: true
        }, function(err, count) {
            if (err) {
                log.error('error updating last message date', err);
            }
        });
    }
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
    db.collection('cameras').find().toArray(function(err, result) {
        if (err) throw err;
        cb(result);
    });
};

exports.getCamera = function(name, cb) {
    db.collection('cameras').findOne({
        name: name
    }, function(err, result) {
        if (err) throw err;
        cb(result);
    });
};

// Takes a camera name and an object with settings to set, creates a new camera
// if the camera name does not exist.
exports.updateCamera = function(camName, settings, callback) {
    db.collection('cameras').update({
        name: camName,
    }, {
        $set: settings
    }, {
        upsert: true
    }, function(err, count) {
        if (callback) {
            callback(err, count);
        } else {
            if (err) {
                log.error('error marking video as uploaded', err);
            } else {
                log.info(camName + ' updated');
            }
        }
    });
};


// Video Functions
// ---------------

// Optional callback takes an error message if error and count of updated as per mongodb
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

    // Track last video time
    db.collection('cameras').update({
        name: camName,
    }, {
        $currentDate: {
            lastVideo: true
        }
    }, {
        upsert: true
    }, function(err, count) {
        if (err) {
            log.error('error updating last video date', err);
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
