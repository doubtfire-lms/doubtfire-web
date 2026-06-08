<p align="center"> 
	<img alt="OnTrack logo" src="src/assets/icons/android-chrome-192x192.png" width="192">
</p>

# OnTrack Web [![CI](https://img.shields.io/github/workflow/status/doubtfire-lms/doubtfire-web/Node.js%20CI?label=CI&logo=GitHub)](https://github.com/doubtfire-lms/doubtfire-web/actions/workflows/nodejs-ci.yml)

A modern, lightweight learning management system.

## Table of Contents

- [Doubtfire Web ![CI](https://github.com/doubtfire-lms/doubtfire-web/actions/workflows/nodejs-ci.yml)](#doubtfire-web-)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Deployment](#deployment)
  - [Resources](#resources)
  - [Contributing](#contributing)
  - [License](#license)

## Getting Started

If you will be using [Docker](https://github.com/doubtfire-lms/doubtfire-api/#getting-started-via-docker), follow the instructions there.

Before you get started, make sure you have the [Doubtfire API](https://github.com/doubtfire-lms/doubtfire-api) up and running. You will need to do this before continuing.

First, clone the web repository, and change to the root directory:

```sh
git clone https://github.com/doubtfire-lms/doubtfire-web.git
cd ./doubtfire-web
```

You can automate the installation process by running the automated setup script:

```sh
./setup.sh
```

Or, you can continue following the below steps to manually install `doubtfire-web`.

Install [Node.js](http://nodejs.org/) either by [downloading it](http://nodejs.org/download/) and installing it manually, or via [Homebrew](http://brew.sh) on OS X:

```sh
brew install node
```

_or_ by using `apt-get` on Linux:

```sh
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install nodejs
```

Install Ruby [SASS](http://sass-lang.com):

```sh
gem install sass
```

If `gem` fails, you should read the Doubtfire API README to install ruby. If you are _not_ using `rbenv`, e.g., using Docker instead, you may need to prepend `sudo` to the above commands to have root write access.

If using `rbenv`, rehash to ensure each of the gems are on your `PATH`:

```sh
rbenv rehash
```

Install all node dependencies using `npm`, as well as [grunt-cli](http://gruntjs.com/using-the-cli) globally:

```sh
npm install
```

**Note:** You may need to install `grunt-cli` globally in Linux using `sudo`.

Lastly, to compile and run a watch server and web server, use `npm start`:

```sh
npm start
```

This will automatically run the angular 1 `grunt watch`, and the angular 7 `ng serve`.

You can then navigate to the Doubtfire web interface at **http://localhost:8000**.

## Deployment

To compile the front-end, ensure `doubtfire-api` is placed as a sibling directory to `doubtfire-web`, then run:

```sh
cd /path/to/repos
ls
doubtfire-api    doubtfire-web
cd ./doubtfire-api
grunt deploy
```

You may prefix this command with the following environment variables:

- `DF_API_URL` - the URL of the API (e.g., `https://doubtfire.com/api`). This will default to `window.location.host` if not set and dynamically generate a URL.
- `DF_EXTERNAL_NAME` - a new name that removes references to the _Doubtfire_ name should you so want to not use such its original name (😢).

## Resources

Doubtfire Web is an [Angular](https://angular.dev) application built using [Material UI]https://material.angular.dev). It uses many Open Source libraries, which you can read up on:

- [Lodash](http://lodash.com/docs)
- [Moment.js](http://momentjs.com)
- [NVD3 Charts](http://krispo.github.io/angular-nvd3/#/)

## Contributing

Refer to [CONTRIBUTING.md](CONTRIBUTING.md)

## License

Licensed under GNU Affero General Public License (AGPL) v3
