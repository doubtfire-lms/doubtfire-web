#
# Use this module to define all third-party dependencies
# that are used in Doubtfire
#
ngCookies = require('angular-cookies')
ngCsv = require('ng-csv')
ngSanitize = require('angular-sanitize')

uiRouter = require('angular-ui-router')
uiBootstrap = require('angular-ui-bootstrap')

codemirror = require('codemirror')
uiCodemirror = require('angular-ui-codemirror')

ngFileUpload = require('angular-file-upload')
ngFilter = require('angular-filter')
ngMarkdown = require('angular-markdown-filter')
ngD3 = require('angular-nvd3')
ngXeditable = require('angular-xeditable')
ngLocalStorage = require('angular-local-storage')

ngAngulartics = require('angulartics')
ngAngularticsGoogleAnalytics = require('angulartics-google-analytics')

utilsService = require('./libs/utilService')

mod = angular.module('doubtfire.config.vendor-dependencies', [
  # ng*
  'ngCookies'
  'ngCsv'
  'ngSanitize'

  # ui.*
  'ui.router'
  'ui.bootstrap'
  'ui.codemirror'

  # other libraries
  'angularFileUpload'
  'angular.filter'
  'markdown'
  'nvd3'
  'xeditable'
  'LocalStorageModule'

  # analytics
  'angulartics'
  'angulartics.google.analytics'

  # manually included libs
  utilsService

])
module.exports = mod.name
