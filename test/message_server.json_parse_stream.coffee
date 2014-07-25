JSONParseStream = require('../servers/message_server/json_parse_stream').JSONParseStream

describe 'JSONParseStream', ->
    parser = null
    beforeEach ->
        parser = new JSONParseStream()

    it 'should parse an object on a single chunk', (done) ->
        obj = null
        parser.on 'end', ->
            obj.should.eql { a : 5, b: 'Hello' }
            done()
        parser.on 'data', (data) ->
            obj = data
        parser.end '{ "a": 5, "b"  : "Hello"  }', 'utf8'

    it 'should parse an object on multiple chunks', (done) ->
        obj = null
        parser.on 'end', ->
            obj.should.eql { a : 5, b : 7 }
            done()
        parser.on 'data', (data) ->
            obj = data
        parser.write '{ "a": 5 \r\n', 'utf8'
        parser.end ',"b":7}\r\n   '

    it 'should remove the *HELLO* message on its own chunk', (done) ->
        obj = null
        parser.on 'end', ->
            obj.should.eql { a : 5, b : 7 }
            done()
        parser.on 'data', (data) ->
            obj = data
        parser.write '*HELLO*'
        parser.write '{ "a": 5 \r\n', 'utf8'
        parser.end ',"b":7}\r\n   '

###
    it 'should remove the *HELLO* message with data in the same chunk', (done) ->
        obj = null
        parser.on 'end', ->
            obj.should.eql { a : 5, b : 7 }
            done()
        parser.on 'data', (data) ->
            obj = data
        parser.write '*HELLO* { "a": 5 \r\n', 'utf8'
        parser.end ',"b":7}\r\n   '
###
