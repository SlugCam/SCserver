var path = require('path');
var dataDir = '_data';
module.exports = {
    "db": {
        "port": 7880,
        "hostname": "localhost",
        "path": path.join(__dirname, dataDir, 'db')
    },
    "apiServer": {
        "port": 7891,
        "hostname": "localhost"
    },
    "messageServer": {
        "port": 7892,
        "hostname": "localhost"
    },
    "videoServer": {
        "port": 7893,
        "hostname": "localhost",
        "path": path.join(__dirname, dataDir, 'videos')
    }
};
