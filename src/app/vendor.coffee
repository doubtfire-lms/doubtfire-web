#
# Use this module to define all third-party dependencies
# that are used in Doubtfire
#

ngCookies = require('angular-cookies')
ngCsv = require('ng-csv')
ngSanitize = require('angular-sanitize')

uiRouter = require('angular-ui-router')
uiBootstrap = require('angular-ui-bootstrap')

# angular-ui-codemirror expects window.CodeMirror
window.CodeMirror = require('codemirror')
uiCodemirror = require('angular-ui-codemirror')

ngFilter = require('angular-filter')

# angular-markdown-filter expects window.showdown to exist
window.showdown = require('showdown')
ngMarkdown = require('angular-markdown-filter')

d3 = require('d3')
nvd3 = require('nvd3')
ngNvd3 = require('angular-nvd3')

ngXeditable = require('angular-xeditable')
ngLocalStorage = require('angular-local-storage')

ngAngulartics = require('angulartics')
ngAngularticsGoogleAnalytics = require('angulartics-google-analytics')

mod = angular.module('doubtfire.vendor', [
  # ng*
  'ngCookies'
  'ngCsv'
  'ngSanitize'

  # ui.*
  'ui.router'
  'ui.bootstrap'
  'ui.codemirror'

  # other libraries
  'angular.filter'
  'markdown'
  'nvd3'
  'xeditable'
  'LocalStorageModule'

  # analytics
  'angulartics'
  'angulartics.google.analytics'

])
module.exports = mod.name
