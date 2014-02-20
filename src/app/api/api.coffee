angular.module("wangular-grunt.api", [
  "ngResource"
])

.constant("api", '/* @echo API_URL */') # Set in env.config.js

.factory("resourcePlus", ($resource, api, currentUser) ->

  (url, paramDefaults, actions) ->
    # Prefix specified relative url with API endpoint.
    url = api + url

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

# Example API definitions

# .factory("JobOpportunity", (resourcePlus) ->

#   jobOpportunity = resourcePlus "/job_opportunities/:id/:action", { id: "@id" }, {
#     "publish": { params: { action: "publish" }, method: "PUT" },
#     "revoke": { params: { action: "revoke" }, method: "PUT" },
#     "apply": { params: { action: "apply" }, method: "PUT" },
#     "reject": { params: { action: "reject" }, method: "PUT" },
#     "allocate": { params: { action: "allocate" }, method: "PUT" },
#     "deallocate": { params: { action: "deallocate" }, method: "PUT" },
#     "reallocate": { params: { action: "reallocate" }, method: "PUT" },
#     "remove": { params: { action: "remove" }, method: "PUT" },
#   }

#   jobOpportunity

# )
# .factory("AgencyRecruitmentContract", (resourcePlus) ->

#   resourcePlus "/agencies/:agencyId/recruitment_contracts/:id", { agencyId: "@agencyId", id: "@id" }

# ).factory("Shift", (resourcePlus) ->

#   resourcePlus "/shifts/:id", { id: "@id" }

#   shift = resourcePlus  "/shifts/:id/:action", { id: "@id" }, {
#     "duplicate":  { params: { action: "duplicate" }, method: "POST" },
#     "close":      { params: { action: "close" }, method: "PUT" },
#     "dismissStaff": { params: { action: "dismiss_staff" }, method: "PUT" }
#     "removeMultiple": { params: { action: "remove_multiple" }, method: "PUT", isArray: true }
#   }

#   shift
# )
