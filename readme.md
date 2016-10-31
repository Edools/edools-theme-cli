# Edools Theme CLI

The Edools Theme CLI is a command line tool that allows you to manage and edit theme files directly on your computer.

### Requirements

* NodeJs ( < v7 until now, because the lib **node-sass** not support linux 64bits )

### Getting Started

`$ npm i -g edools-theme-cli`

### Theme Structure

```
.
├── assets
│   ├── images                      # Theme Images (optional).
│   │                 
│   ├── js                          # Theme Javascript Files (optional).
│   │
│   ├── scss                        # Theme Scss Files (optional).
│   │    │
│   │    └── theme.base.scss        # Main scss file, you can import other scss files
│   │                                 inside scss folder. (required if you want to use scss).
│   │
│   ├── theme.js.liquid             # Use this file if you want to merge liquid params into javascript.
│   │
│   └── theme.scss.liquid           # Use this file if you want to merge liquid params into scss.
│
├── config
│   │
│   ├── settings_data_schema.json   # Theme customization schema.
│   │
│   ├── settings_data.json          # Theme customization data.
│
│
├── layouts                         # Liquid layouts
│
├── locales                         # i18n json files
│
├── mailers                         # Email Templates
│
├── snippets                        # Liquid snippets
│
├── templates                       # Liquid templates
│
├── .csscomb.json                   # CSSComb config (optional) read more at http://csscomb.com.
│
├── bower.json                      # Bower config (optional).
│
├── theme.json                      # Theme config file.


```

### Commands

You can use `edools-theme` or the alias `edt`

Ps: All of the following commands needs to be executed in the target theme folder.

`-h` help

`-V` version

#### Start a New Theme:

Creates an empty theme with basic configuration. You can use this command to start editing an existing theme downloaded from your school.

Command: `edt init` or `edt i`

Example: 

```
mkdir my-theme 

cd my-theme 

edt i "My Theme" "Author Name"
```

#### Serve

Creates a proxy server for realtime edit. When serve is running all of your local changes will be uploaded to your online theme. The browser will be reloaded automatically when you change a file.

Default url: [https://localhost:3000](https://localhost:3000)


Command: `edt serve` or `edt s`

Create a local server which observes for changes in your local files and upload the files to your sandbox url.

#### Build

Builds theme's assets like scss, js and bower js files.


Command: `edt build` or `edt b`

#### Upload Files to School

Uploads a single file or the entire theme if no file path provided.

Command: `edt upload` or `edt u`

Example: `edt u templates/index.liquid`

##### Warning: This command replaces the remote file, if you doesn't input a file path, all of the remote files will be overriden by local files.


#### Download Files to Local Folder

Downloads a single file or the entire theme if no file path provided.

Command: `edt download` or `edt d`

Example: `edt d templates/index.liquid`

##### Warning: This command replaces the local file, if you doesn't input a file path, all of the local files will be overriden by remote files.


### Development

* Clone Repository
* Run `$ cd edools-theme-cli && npm i`
* Run `$ npm link .`
* Run `$ npm run dev`
