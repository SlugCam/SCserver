# lib.db.coffee
# =============
#
# This is our database layer testing module. This is a functional test in which
# we spin up a testing mongo process, drop the SWEETnet database before each
# test, and kill the database process at the end of it all.

# Imports
# -------

# Support modules
require 'shelljs/global'
logger = require './lib/dummy_logger'
fs = require 'fs'

# This is the module that we are testing.
db = require '../servers/lib/db'

# Setup
# -----
#
# Spin up a database process and configure the module to use said database.

config =
    db:
        hostname: 'localhost'
        port: '8934'
        path: './_data/testing/db'

mkdir('-p', config.db.path)

dbproc = exec('mongod --dbpath ' + config.db.path + ' --port ' + config.db.port, {
    async: true,
    silent: true
})
dbLog = fs.createWriteStream './_logs/db_testing.log', {flags: 'a'}
dbproc.stdout.pipe(dbLog)

db.setConfig(config, logger)

# Mocha Setup
# -----------


describe 'db library functional tests', ->

    # ### Setup and Teardown
    beforeEach ->
        exec 'mongo --port ' + config.db.port +
             ' SWEETnet --eval "db.dropDatabase()"',
             {silent:true}

    after ->
        dbproc.kill()



    # ### Test Descriptions
    #
    # Make sure that the gets are in the callback
    # 
    # #### Message Functions
    describe 'message functions', ->
        it 'should 1', (done) ->
            db.storeMessage {'a':1}, ->
                db.getMessages (data)->
                    done()

        it 'should 2', (done) ->
            db.storeMessage({'b':2})
            db.getMessages (data) ->
                done()

    # #### DB Testing Sanity Tests
    describe 'database should be cleared between tests', ->
        it 'store a message, and ensure that there is one message in the 
            database', (done) ->
                db.storeMessage {'a':1}, ->
                    db.getMessages (data)->
                        data.length.should.eql(1)
                        done()

        it 'ensure that the previously stored message is not accessible in this 
            test', (done) ->
                db.getMessages (data) ->
                    data.length.should.eql(0)
                    done()

