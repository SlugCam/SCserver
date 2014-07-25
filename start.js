require('shelljs/global');

var config = require('./config');
var messageServer = require('./servers/message_server');
var apiServer = require('./servers/api_server');
var videoServer = require('./servers/video_server');

require('./servers/lib/db').setConfig(config);

mkdir('-p', config.videoServer.path);
mkdir('-p', config.db.path);

messageServer.listen(config.messageServer.port);
apiServer.listen(config.apiServer.port);
videoServer.listen(config.videoServer.port);

exec('mongod --dbpath ' + config.db.path + ' --port ' + config.db.port, {async:true});

cd('webapp');
exec('npm start', {async:true});
