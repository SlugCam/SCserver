// video_protocol.js
// =================
//
// This file contains a writable stream that reads a TCP stream and parses our
// video transfer protocol.

var Writable = require('stream').Writable;
var util = require('util');
var fs = require('fs');
var path = require('path');

// This function takes a buffer as an argument and returns the index of the
// first null byte, or -1 if a null byte is not found.
function findNullByte(buff) {
    var nullIndex = -1;
    for (var i = 0; i < buff.length; i++) {
        if (buff.get(i) === 0) {
            nullIndex = i;
            break;
        }
    }
    return nullIndex;
}

// VideoProtocol Writable Stream
// -----------------------------

util.inherits(VideoProtocol, Writable);

// This is the constructor for our stream object. It takes the a path in which
// to store videos as an argument. *This path must already exist.*
function VideoProtocol(outputPath) {
    Writable.call(this, {});
    this.outputPath = outputPath;
    this.buff = new Buffer(0);
    this.camName = null;
    this.vidId = null;
    this.vidLength = null;
    this.fileStream = null;
}

// This is the method that requires overwriting in the Node writable stream
// api. For more information, read the streams section in the Node docs. Node
// will automatically call this when things are piped to the stream.
VideoProtocol.prototype._write = function(chunk, encoding, callback) {
    var that = this;
    // TODO: I believe this concat will "reset" the slices, eliminating need
    // for further processing. This should be checked however.
    this.buff = Buffer.concat([this.buff, chunk]);
    this._scan.call(that);
};

// `_scan` contains the bulk of the work, it scans through the current
// buffer, while referencing the current state of our stream, either reading
// meta data or piping the video data into a file.
VideoProtocol.prototype._scan = function() {
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
        this.fileStream = fs.createWriteStream(
            this.getAndCheckPath.call(that)
        );
        // We have everything we need, so open up a file stream
    }
    if (continueScan) {
        this.fileStream.write(this.buff);
        // Everything is setup, so just write to the file stream
        // TODO Check if this length is done
    }

    // TODO Check for the stream being finished


    //TODO remove else, check for continue to new video
    console.log(this.camName, this.vidId, this.vidLength);
};
// TODO this could be more robust.
VideoProtocol.prototype.getAndCheckPath = function() {
    var camDir = path.join(this.outputPath, this.camName);
    if (!fs.existsSync(camDir)) {
        fs.mkdirSync(camDir);
    }
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
    ret = {
        success: false,
        value: null,
        buffer: buff
    };
    // If we have a null byte, we know that there is a finished camera name.
    nullIndex = findNullByte(buff);
    if (nullIndex != -1) {
        ret.success = true;
        ret.value = buff.toString('ascii', 0, nullIndex);
        ret.buffer = buff.slice(nullIndex + 1);
    }
    return ret;
}

// `parseInt(buff)` parses a UInt32BE from the buffer if it is long enough.
function parseInt(buff) {
    ret = {
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
//
// This module only exports the VideoProtocol writable stream.

exports.VideoProtocol = VideoProtocol;
