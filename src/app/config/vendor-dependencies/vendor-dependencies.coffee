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

  # ui.*
  'ui.router'
  'ui.router.upgrade'
  'ui.bootstrap'
  'ui.codemirror'

  # other libraries
  'angularFileUpload'
  'angular.filter'
  'localization'
  'markdown'
  'nvd3'
  'xeditable'
  'LocalStorageModule'
  'angular-md5'

  # analytics
  'angulartics'
  'angulartics.google.analytics'
])
