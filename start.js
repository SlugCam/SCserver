require('shelljs/global');

var config = require('./config');
var messageServer = require('./servers/message_server');
var apiServer = require('./servers/api_server');
var videoServer = require('./servers/video_server');
var bunyan = require('bunyan');

exec('mongod --dbpath ' + config.db.path + ' --port ' + config.db.port, {
    async: true,
    silent: true
});

require('./servers/lib/db').setConfig(config, bunyan.createLogger({
    name: "dataLib",
    level: "trace"
}));

mkdir('-p', config.videoServer.path);
mkdir('-p', config.db.path);

messageServer.listen(config.messageServer.port, bunyan.createLogger({
    name: 'messageServer',
    level: "trace"
}));

apiServer.listen(config.apiServer.port, bunyan.createLogger({
    name: 'apiServer',
    level: "trace"
}));

videoServer.listen(config.videoServer.port, bunyan.createLogger({
    name: 'videoServer',
    level: "trace"
}));


cd('webapp');

exec('npm start', {
    async: true
});
