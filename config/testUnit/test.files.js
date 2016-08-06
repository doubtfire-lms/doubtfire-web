'use strict';
// This file is run inside a Webpack context, which allows it to use require.context() to get a list of files to include at run time

// Polyfill required for PhantomJS
require('phantomjs-polyfill');

// Load the test dependencies!
require('angular');
require('angular-mocks');
// require('angular-route');

// Don't load any source code! The unit tests are responsible for loading the code-under-test.
// Includes the *.spec.<ext> files in the unitTest directory. The '../../' is the relative path from where
// this file is (config/testUnit/) to where the source folders are.

/* global __karmaTestSpec */
var testsContext = require.context('../../src/app', true, __karmaTestSpec);

testsContext.keys().forEach(testsContext);
