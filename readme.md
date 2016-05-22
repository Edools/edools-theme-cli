# Edools Theme CLI

The Edools Theme CLI is a command line tool that allows you to manage and edit theme files directly on your computer.

### Requirements

* NodeJs

### Getting Started

`$ npm i -g git+https://<username>:<password>@bitbucket.org/edools/edools-theme-cli.git`

### Commands

You can use `edools-theme` or the alias `edt`

`-h` help

`-V` version

`--serve` or `s`

Creates a local server which observes for changes in your local files and upload the files to your sandbox url.


`--build` or `b`

Builds theme locally.

### Development

* Clone Repository
* Run `$ cd edools-theme-cli && npm i`
* Run `$ npm link .`
* Run `$ npm run dev`
