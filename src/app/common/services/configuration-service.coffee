angular.module("doubtfire.common.services.configuration", [])

.constant('external_name', '/* @echo EXTERNAL_NAME */')
#
# Services for a configurable external name
#
.factory("configurationService", (external_name) ->
  configurationService = {}

  configurationService.getExternalName = () ->
    return external_name

  configurationService
)
