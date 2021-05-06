angular.module('doubtfire.config.local-storage', [])
#
# Local Storage Configuration
#
.config((localStorageServiceProvider) ->
  localStorageServiceProvider.setPrefix('doubtfire')
)
