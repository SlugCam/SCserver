// This module could use a lot of optimization, currently we attempt parsing
// too many times. We could fairly easily remove our dependency on 
// json_parse_raw and actually parse the stream as it becomes available, or
// hunt down a separate library.

var util = require('util');
var Transform = require('stream').Transform;
var parseFirstJSON = require('./json_parse_raw').parseFirstJSON;

util.inherits(SimpleProtocol, Transform);

function SimpleProtocol(options) {
    if (!(this instanceof SimpleProtocol)) {
        return new SimpleProtocol(options);
    }

    Transform.call(this);

    this._writableState.objectMode = false;
    this._readableState.objectMode = true;

    this._buffer = '';
}

SimpleProtocol.prototype._transform = function(chunk, encoding, done) {
    // TODO Could be problematic?
    this._buffer += chunk.toString();
    while (true) {
        var parseResults = parseFirstJSON(this._buffer);
        var parsedObject = parseResults[0]; // Object
        var indexOfRest = parseResults[1];
        if (!parsedObject) break;
        this.push(parsedObject);
        this._buffer = this._buffer.substring(indexOfRest);
    }
    done();
};

exports.JSONParseStream = SimpleProtocol;

// Usage:
// var parser = new SimpleProtocol();
// source.pipe(parser)
// Now parser is a readable stream that will emit 'header'
// with the parsed header data.
