// # repl.js

// Provides an interactive environment for testing SWEETnet components.

var repl = require('repl');


var SWEETrepl = repl.start('SWEETnet $ ');

SWEETrepl.context.config = require('./config.json');
SWEETrepl.context.bot = require('./testing/cam_bot')(SWEETrepl.context.config);
SWEETrepl.context.messageServer = require('./servers/message_server')(SWEETrepl.context.config);
SWEETrepl.context.apiServer = require('./servers/api_server')(SWEETrepl.context.config);

