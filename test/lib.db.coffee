require 'shelljs/global'
db = require '../servers/lib/db'
logger = require './lib/dummy_logger'

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

db.setConfig(config, logger)

# Tests
# -----

describe 'db library functional tests', ->
    beforeEach ->
        exec 'mongo --port ' + config.db.port + ' SWEETnet --eval "db.dropDatabase()"',
            {silent:true}

    afterEach ->

    describe 'message functions', ->
        it 'should 1', (done) ->
            db.storeMessage({'a':1})
            db.getMessages (data)->
                console.dir(data)
                done()

        it 'should 2', (done) ->
            db.storeMessage({'b':2})
            db.getMessages (data) ->
                console.dir(data)
                done()



# Kill Database
# -------------
dbproc.kill()

