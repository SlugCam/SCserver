// video_protocol.js
// =================
//
// This file contains a writable stream that reads a TCP stream and parses our
// video transfer protocol.
//
// TODO is memory leak possible?

var Writable = require('stream').Writable;
var util = require('util');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp').sync;
var exec = require('child_process').exec;

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
    this.lengthWritten = 0;
}

// This is the method that requires overwriting in the Node writable stream
// api. For more information, read the streams section in the Node docs. Node
// will automatically call this when things are piped to the stream.
VideoProtocol.prototype._write = function(chunk, encoding, callback) {
    var that = this;
    // TODO I believe this concat will "reset" the slices, eliminating need
    // for further processing. This should be checked however.
    this.buff = Buffer.concat([this.buff, chunk]);
    this._scan.call(that);
    // TODO Need to call callback
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
            this.getAndCheckTmpPath.call(that) + '.avi'
        );
        // TODO will finish be called even if stream incorrectly terminated
        this.fileStream.on('finish', downloadCompleter(this.camName, this.vidId));
        this.lengthWritten = 0;
        // We have everything we need, so open up a file stream
    }
    if (continueScan) {
        // TODO length or byteLength (all over this file)
        var remainingData = this.vidLength - this.lengthWritten;
        if (remainingData <= this.buff.length) {
            // We are done
            this.fileStream.write(this.buff.slice(0, remainingData));
            this.buff = this.buff.slice(remainingData);
            this.fileStream.end();
        } else {
            // There is more 
            this.fileStream.write(this.buff);
            this.buff = new Buffer(0);
        }
        // Everything is setup, so just write to the file stream
        // TODO Check if this length is done
    }

    // TODO Check for the stream being finished to clean up


    //TODO remove else, check for continue to new video
    console.log(this.camName, this.vidId, this.vidLength);
};

function downloadCompleter(outputPath, camName, vidId) {
    return function() {
        var tmpPath = path.join(outputPath, 'tmp', camName, vidId.toString() + '.avi');
        // make output directory if it does not exist
        var camDir = path.join(outputPath, 'vids', camName);
        mkdirp(camDir);
        var outPath = path.join(camDir, vidId.toString());
        // move file to output directory
        fs.renameSync(tmpPath, outPath + '.avi');
        // mark as complete in database and send ack
        // TODO
        // start conversion, when done mark as converted
        exec('ffmpeg -i ' + outPath + '.avi ' + outPath + '.mp4',
            function(error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
    };
}

// TODO more importantly, could avoid much of the directory checking
// TODO this could be more robust.
VideoProtocol.prototype.getAndCheckTmpPath = function() {
    var camDir = path.join(this.outputPath, 'tmp', this.camName);
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
