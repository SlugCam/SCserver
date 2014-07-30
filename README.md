# SWEETnet

The network software behind the SWEETcam system.

## Usage

Configuration file can either be json or js.

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

