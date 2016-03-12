#
# Use this module to define all third-party dependencies
# that are used in Doubtfire
#
angular.module('doubtfire.config.vendor-dependencies', [
  # ng*
  'ngCookies'
  'ngCsv'
  'ngSanitize'

  # templates
  'templates-app'
  'templates-common'

  # ui.*
  'ui.router'
  'ui.bootstrap'
  'ui.codemirror'
  'ui.select'

  # other libraries
  'angularFileUpload'
  'angular.filter'
  'localization'
  'markdown'
  'nvd3'
  'xeditable'
  'LocalStorageModule'

  # analytics
  'angulartics'
  'angulartics.google.analytics'
])
