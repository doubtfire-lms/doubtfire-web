mod = angular.module("doubtfire.api.models.task-comment", [])

.factory("TaskComment", (resourcePlus) ->
  resourcePlus "/projects/:project_id/task_def_id/:task_definition_id/comments/:id", { id: "@id", project_id: "@project_id", task_definition_id: "@task_definition_id" }
)

module.exports = mod.name
