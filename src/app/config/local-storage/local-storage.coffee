angular.module('', [])

.config((localStorageServiceProvider) ->
  localStorageServiceProvider.setPrefix('doubtfire')
)
