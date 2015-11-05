angular.module("doubtfire.services.redirect", [])

.factory("redirectService", ($state, $stateParams) ->
  #
  # The redirect service object
  #
  redirectService = {}

  #TODO: need to test multiple params and nested objects here...
  deserialize = (str, prefix) ->
    result = {}
    parts = str.split "&"

    for i, attr of parts
      kv = attr.split "="
      k = kv[0]
      v = kv[1]
      result[k] = v

    result

  redirectService.redirect = (defaultState, defaultParams) ->
    destState = defaultState
    destParams = defaultParams

    if $stateParams["dest"]
      destState = $stateParams["dest"]
      destParams = deserialize $stateParams["params"]

    $state.go destState, destParams

  redirectService
)