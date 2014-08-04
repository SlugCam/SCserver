// video_protocol.js
// =================
//
// This file contains a writable stream that reads a TCP stream and parses our
// video transfer protocol. Uses the node EventEmitter interface with the event
// `videoReceived` emitted after a video is fully received. The listener should
// be a function that takes the camera name and id as arguments.
//
// TO-DO
// -----
// 
// - Is memory leak possible?
// - Should we check if video has been sucessfully downloaded before allowing
//   the overwrite of a correct video that may fail?
// - Are we checking directories to often?

var Writable = require('stream').Writable;
var util = require('util');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp').sync;
var exec = require('child_process').exec;
var EventEmitter = require("events").EventEmitter;

// These must be set before use by the exported configure function
var baseDir, log;

// This function takes a buffer as an argument and returns the index of the
// first null byte, or -1 if a null byte is not found.
function findNullByte(buff) {
    var nullIndex = -1;
    var i;
    for (i = 0; i < buff.length; i++) {
        if (buff.get(i) === 0) {
            nullIndex = i;
            break;
        }
    }
    return nullIndex;
}

// VideoProtocol Writable Stream
// -----------------------------


// This is the constructor for our stream object. 
function VideoProtocol() {
    log.trace('New VideoProtocol created');
    if (!log || !baseDir) {
        throw 'Video protocol module must be configured before use';
    }
    Writable.call(this, {});
    this.buff = new Buffer(0);
    this.camName = null;
    this.vidId = null;
    this.vidLength = null;
    this.fileStream = null;
    this.remainingData = null; // doesn't need to be here
    this.events = new EventEmitter();
}
util.inherits(VideoProtocol, Writable);

// This is the method that requires overwriting in the Node writable stream
// api. For more information, read the streams section in the Node docs. Node
// will automatically call this when things are piped to the stream.
VideoProtocol.prototype._write = function(chunk, encoding, callback) {
    var that = this;
    // TODO I believe this concat will "reset" the slices, eliminating need
    // for further processing. This should be checked however.
    this.buff = Buffer.concat([this.buff, chunk]);
    this._scan.call(that);
    callback();
};

// `_scan` contains the bulk of the work, it scans through the current
// buffer, while referencing the current state of our stream, either reading
// meta data or piping the video data into a file.
VideoProtocol.prototype._scan = function() {
    log.trace('VideoProtocol#scan called, buffer length:', this.buff.length, 'buffer:', this.buff);
    // Continue scan starts as false, because we will scan again only if we
    // are able to successfully parse a value at some point (at which point we
    // will set it to true). If we never successfully parse a value, we know we
    // have consumed the entire stream.
    var continueScan = true,
        that = this,
        parseResults;

    // This chain works because at each step, we know the rest exist, and
    // this protocol always goes in the same order.
    if (continueScan && !this.camName) {
        // Waiting for cam name.
        parseResults = parseString(this.buff);
        continueScan = parseResults.success;
        this.camName = parseResults.value;
        this.buff = parseResults.buffer;
    }

    if (continueScan && !this.vidId) {
        // Waiting for vid id
        parseResults = parseInt(this.buff);
        continueScan = parseResults.success;
        this.vidId = parseResults.value;
        this.buff = parseResults.buffer;
    }

    if (continueScan && !this.vidLength) {
        // Waiting for length
        parseResults = parseInt(this.buff);
        continueScan = parseResults.success;
        this.vidLength = parseResults.value;
        this.buff = parseResults.buffer;
    }

    if (continueScan && !this.fileStream) {
        log.trace('VideoProtocol: creating file stream');
        // We have everything we need, so open up a file stream
        this.fileStream = fs.createWriteStream(
            this.getAndCheckTmpPath.call(that) + '.avi'
        );
        // TODO will finish be called even if stream incorrectly terminated?
        this.fileStream.on('finish', this._downloadCompletionFunctionFactory.call(that));
        this.remainingData = this.vidLength;

    }
    if (continueScan) {
        // Everything is setup, so just write to the file stream
        log.trace('scan pushing to data to file stream');
        if (this.remainingData <= this.buff.length) {
            log.trace('all data for file has been received');
            // We are done
            this.fileStream.write(this.buff.slice(0, this.remainingData));
            this.buff = this.buff.slice(this.remainingData);
            this.fileStream.end();
            // Reset everything, noting that these are all the conditions to
            // restart the if chain
            this.camName = null;
            this.vidId = null;
            this.vidLength = null;
            this.fileStream = null;
            // remainingData will be reset later

            // continueScan is still true here like it should be
        } else {
            log.trace('pushing data to file, not complete; remaining',
                this.remainingData, ', bufflength:', this.buff.length);
            // There is more 
            this.remainingData = this.remainingData - this.buff.length;
            this.fileStream.write(this.buff);
            this.buff = new Buffer(0);
            continueScan = false;
        }
    }

    // This means buffer still may contain part of another video, so continue
    // the scan. This avoids the possibility of having an entire video in the
    // buffer with the client not needing to write anything, which would create
    // a deadlock.
    if (continueScan) {
        this._scan.call(that);
    }
};

// This function returns a function to be called after the video is complete.
// This returned function, moves the 
VideoProtocol.prototype._downloadCompletionFunctionFactory = function() {
    var camName = this.camName;
    var vidId = this.vidId;
    var ee = this.events;
    return function() {
        log.trace('downloadCompleter called (file write stream finished) for' +
            camName + '/' + vidId.toString());

        var tmpPath = path.join(baseDir, 'tmp', camName, vidId.toString() + '.avi');
        // make output directory if it does not exist
        var camDir = path.join(baseDir, 'vids', camName);
        mkdirp(camDir);
        var outPath = path.join(camDir, vidId.toString());
        // move file to output directory
        fs.renameSync(tmpPath, outPath + '.avi');
        // start conversion, when done mark as converted
        exec('ffmpeg -i ' + outPath + '.avi ' + outPath + '.mp4',
            function(error, stdout, stderr) {
                log.trace('ffmpeg: ' + stdout);
                log.error('ffmpeg: ' + stderr);
                if (error !== null) {
                    log.error('ffmpeg exited with error code: ' + error);
                }
            });
        // Emit our video received event
        ee.emit('videoReceived', camName, vidId);
    };
};

VideoProtocol.prototype.getAndCheckTmpPath = function() {
    var camDir = path.join(baseDir, 'tmp', this.camName);
    mkdirp(camDir);
    return path.join(camDir, this.vidId.toString());
};

// Parsing Functions
// -----------------
//
// These functions are used to parse individual elements from a buffer and
// return an object containing the following:
//
// - success: boolean that is true if we were able to parse
// - value: the parsed value, this will be null if unable to parse
// - buffer: a slice containing the remainder of the buffer

// `parseString(buff)` parses the a null terminated ASCII string from the 
// specified buffer.
function parseString(buff) {
    var ret = {
        success: false,
        value: null,
        buffer: buff
    };
    // If we have a null byte, we know that there is a finished camera name.
    var nullIndex = findNullByte(buff);
    if (nullIndex !== -1) {
        ret.success = true;
        ret.value = buff.toString('ascii', 0, nullIndex);
        ret.buffer = buff.slice(nullIndex + 1);
    }
    return ret;
}

// `parseInt(buff)` parses a UInt32BE from the buffer if it is long enough.
function parseInt(buff) {
    var ret = {
        success: false,
        value: null,
        buffer: buff
    };
    if (buff.length >= 4) {
        ret.success = true;
        ret.value = buff.readUInt32BE(0);
        ret.buffer = buff.slice(4);
    }
    return ret;
}

// Exports
// -------

// dataDirectory is a path in which to store videos as an argument. *This path
// must already exist.*, logger is a logging object (we are currently using
// bunyan)
exports.configure = function(dataDirectory, logger) {
    baseDir = dataDirectory;
    log = logger;
};

// VideoProtocol is the main writable stream
exports.VideoProtocol = VideoProtocol;
