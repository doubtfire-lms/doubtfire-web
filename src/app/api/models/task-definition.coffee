angular.module("doubtfire.api.models.task-definition", [])

.factory("TaskDefinition", (resourcePlus) ->
  TaskDefinition = resourcePlus "/task_definitions/:id", { id: "@id" }
)
