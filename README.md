# SWEETnet

The network software behind the SWEETcam system.

## Usage

Configuration file can either be json or js.

### Running as Daemon

To run the servers as a daemon, we are currently using
[forever](https://github.com/nodejitsu/forever). Forever not only starts a
script as a daemon, but also restarts it if it crashes. Forever is installed
locally as a dependency in the npm package, so the program can be accessed in
`node_modules/.bin`, however the npm package also provides the following
scripts:

- `npm run startd`: starts the servers as a daemon
- `npm run restartd`: restarts the daemon
- `npm run stopd`: stop the daemon

Forever provides its own logging system and further information can be found in
its documentation. Optimally this should be implemented at the individual server
level so that each server can individually restart as well, this will be done at
a later time.
## Development

npm is used for package management. To install all project dependencies locally
run the command `npm install`.

Grunt is used for several tasks, newer versions of Grunt install the Grunt
package locally to the project and use grunt-cli to run the local grunt. To
install grunt-cli globally on your system, run `npm install -g grunt-cli`.

## Dependencies

- mongo is required, available in homebrew and other package managers.
- grunt-cli must be installed globally to use grunt.

Note that for growl to work on OSX for testing

```sh
sudo gem install terminal-notifier
```

### groc

Groc is used to produce literate style documentation from the source code.  The
configuration for groc is stores in .groc.json.

