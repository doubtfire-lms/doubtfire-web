angular.module('doubtfire.config.local-storage', [])
#
# Local Storage Configuration test
#

.config((localStorageServiceProvider) ->
  localStorageServiceProvider.setPrefix('doubtfire')
)
