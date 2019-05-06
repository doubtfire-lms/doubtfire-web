angular.module("doubtfire.api.resource-plus", [
  "ngResource"
])

#
# Resource "plus"
# - base URL path
# - the addition of the authentication token
# - change save to use PUT for update and POST for create
#
.factory("resourcePlus", ($resource, DoubtfireConstants, currentUser) ->
  (url, paramDefaults, actions) ->
    # Prefix specified relative url with API endpoint.
    url = DoubtfireConstants.API_URL + url

    # Angular's default save method uses POST for both create and update, but
    # Rails expects a PUT for update. :( To handle this, we must override the
    # save method to make it POST for create and PUT for update. We also
    # expose separate create and update methods that might prove useful.
    actions = angular.extend {}, actions,
      "create": { method: "POST" }
      "update": { method: "PUT" }

    resource = $resource url, paramDefaults, actions
    delete resource["save"]

    angular.extend resource.prototype,
    $save: -> this[if this.id? then "$update" else "$create"].apply this, arguments

    return resource
)
