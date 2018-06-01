angular.module("doubtfire.config.external-name", [])

.factory('ExternalName', ($http, api) ->
  externalName = {
    value: '/* @echo EXTERNAL_NAME */',
    loaded: false,
  }

  $http.get("#{api}/settings").then ((response) ->
    externalName.value = response.data.externalName || "Doubtfire"
  )

  externalName
)



