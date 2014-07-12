// # db.js

// This file contains the data store API. This can be used by all the servers
// to help isolate database specific code from the server protocol 
// implementation.

// Currently this library uses mongo through the mongoskin library.

module.exports = function(config) {
    var exports = {},
        dbPath = 'mongodb://' + config.db.hostname + ':' + config.db.port,
        db = require('mongoskin').db(dbPath + '/SWEETnet');

    // TODO success/failure callback and verification of input
    exports.storeMessage = function(message) {
        // Check if camera is registered
        

        db.collection('mstore').insert(message, function(err, result) {
            if (err) throw err;
            if (result) console.log('Added!');
        });
    };

    // Returns an array of all messages
    exports.getMessages = function(cb) {
        db.collection('mstore').find().toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            cb(result);
        });
    };

    exports.getCameras = function(cb) {
        db.collection('stages').toArray(function(err, result) {
            if (err) throw err;
            cb(result);
        });
    };

    return exports;
};
