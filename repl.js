// # repl.js

// Provides an interactive environment for testing SWEETnet components.

var colors = require('colors');
var repl = require('repl');
var fs = require('fs');
var vm = require('vm');

var readline = require('readline');
var hasAnsi = require('has-ansi');
var stripAnsi = require('strip-ansi');

// http://stackoverflow.com/questions/23569878/adding-color-to-repl-prompt-node
var _setPrompt = readline.Interface.prototype.setPrompt;
readline.Interface.prototype.setPrompt = function() {
    if (arguments.length === 1 && hasAnsi(arguments[0])) {
        return _setPrompt.call(this, arguments[0], stripAnsi(arguments[0]).length);
    } else {
        return _setPrompt.apply(this, arguments);
    }
};

console.log('Welcome to ' + 'SWEET'.bold + 'net! Type ' + 'help()'.underline +
    ' for help.');
console.log('=========================================='.rainbow);

var SWEETrepl = repl.start('SWEETnet'.blue + ' $ ');

vm.runInContext(fs.readFileSync('./util/repl_setup.js', 'utf8'), SWEETrepl.context);

SWEETrepl.context.help = function () {
    
    console.log('================================================================================'.rainbow);
    console.log('SWEET'.bold + 'net Online Help 🌺');

    console.log('\nThis repl is just an enhanced node repl with some handy objects preloaded,');
    console.log('think of this as a shell into the SWEETnet system. Some of the objects include:');
    console.log('\n\t' + 'config'.bold + ' - the configuration file defined at the root of the project');
    console.log('\t' + 'bot.create(name)'.bold + ' - creates a bot with given name');
    console.log('\nThe server objects are all provided:');
    console.log('\n\t' + 'apiServer'.bold);
    console.log('\t' + 'messageServer'.bold);
    console.log('\t' + 'videoServer'.bold);
    console.log('\nEach of these has a listen and start method. The listen method takes a port as');
    console.log('argument and starts the server. The start method starts the server an the port');
    console.log('as given in the configuration file.');
    console.log('================================================================================'.rainbow);
};
