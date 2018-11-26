![Doubtfire Logo](http://puu.sh/lyClF/fde5bfbbe7.png)

# Doubtfire Web

A modern, lightweight learning management system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Resources](#resources)
3. [Contributing](#contributing)
4. [Deployment](#deployment)
5. [License](#license)

## Getting Started

If you will be using [Docker](https://github.com/doubtfire-lms/doubtfire-api/#getting-started-via-docker), follow the instructions there.

Before you get started, make sure you have the [Doubtfire API](https://github.com/doubtfire-lms/doubtfire-api) up and running. You will need to do this before continuing.

Install [Node.js](http://nodejs.org/) either by [downloading it](http://nodejs.org/download/) and installing it manually, or via [Homebrew](http://brew.sh) on OS X:

```
$ brew install node
```

_or_ by using `apt-get` on Linux:

```
$ curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
$ sudo apt-get install nodejs nodejs-legacy
```

Clone the web repository, and change to the root directory:

```
$ git clone https://github.com/doubtfire-lms/doubtfire-web.git
$ cd ./doubtfire-web
```

Install [overcommit](https://github.com/brigade/overcommit) and Ruby [SASS](http://sass-lang.com):

```
$ gem install overcommit sass
```

If `gem` fails, you should read the Doubfire API README to install ruby. If you are *not* using `rbenv`, e.g., using Docker instead, you may need to prepend `sudo` to the above commands to have root write access.

If using `rbenv`, rehash to ensure each of the gems are on your `PATH`:

```
$ rbenv rehash
```

Install and sign the git hooks using `overcommit`:

```
$ overcommit --install
$ overcommit --sign
```

Install all node dependencies using `npm`, as well as [grunt-cli](http://gruntjs.com/using-the-cli) and [bower](http://bower.io) globally:

```
$ npm install
$ npm install -g grunt-cli bower
```

**Note:** You may need to install `grunt-cli` globally in Linux using `sudo`.

Install bower dependencies from `bower.json`:

```
$ bower install
```

Lastly, to compile and run a watch server and web server, use `grunt`:

```
$ grunt
```

You can then navigate to the Doubtfire web interface at **http://localhost:8000**.

## Deployment

To compile the front-end, ensure `doubtfire-api` is placed as a sibling directory to `doubtfire-web`, then run:

```
$ cd /path/to/repos
$ ls
doubtfire-api    doubtfire-web
$ cd ./doubtfire-api
$ grunt deploy
```

You may prefix this command with the following environment variables:

* `DF_API_URL` - the URL of the API (e.g., `https://doubtfire.com/api`). This will default to `window.location.host` if not set and dynamically generate a URL.
* `DF_EXTERNAL_NAME` - a new name that removes references to the _Doubtfire_ name should you so want to not use such its original name (😢).

## Resources

Doubtfire Web is an [Angular](http://angularjs.org) application built using [Bootstrap](http://getbootstrap.com). It uses many Open Source libraries, which you can read up on:

- [Lodash](http://lodash.com/docs)
- [Moment.js](http://momentjs.com)
- [Font Awesome](http://fontawesome.io)
- [UI Router](https://github.com/angular-ui/ui-router)
- [UI Bootstrap](http://angular-ui.github.io/bootstrap/versioned-docs/0.13.4/)
- [UI Select](https://github.com/angular-ui/ui-select)
- [NVD3 Charts](http://krispo.github.io/angular-nvd3/#/)
- [Angular X-Editable](http://vitalets.github.io/angular-xeditable/)
- [Angular Filters](https://github.com/a8m/angular-filter)
- [Angular Markdown Filter](https://github.com/vpegado/angular-markdown-filter)

## Contributing

Refer to CONTRIBUTING.md

## License

Licensed under GNU Affero General Public License (AGPL) v3
