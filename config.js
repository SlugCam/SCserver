var path = require('path');

module.exports = {
    "db": {
        "port": 7890,
        "hostname": "localhost"
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
        "dataPath": path.join(__dirname, 'data/videos'),
    }
};
