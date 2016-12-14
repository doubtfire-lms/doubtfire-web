angular.module("doubtfire.common.services.configuration", [])
#
# Services for a configurable external name
#
.factory("configurationService", () ->
  configurationService = {}

  configurationService.getExternalName = () ->
    return "CainFire"

  configurationService
)
