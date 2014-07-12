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

- node-uuid is used in testing for unique camera names to be generated.
- mongo is required, available in homebrew and other package managers.
