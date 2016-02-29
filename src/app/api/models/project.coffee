angular.module "doubtfire.api.models.project", []

.factory("Project", (resourcePlus) ->
  resourcePlus "/projects/:id", { id: "@id" }
)
