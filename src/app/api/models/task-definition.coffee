angular.module("doubtfire.api.models.task-definition", [])

.factory("TaskDefinition", (resourcePlus) ->
  TaskDefinition = resourcePlus "/task_definitions/:id", { id: "@id" }

  TaskDefinition.taskSheet = resourcePlus "/units/:unit_id/task_definitions/:task_def_id/task_sheet", { unit_id: "@unit_id", task_def_id: "@task_def_id" }
  TaskDefinition.taskResources = resourcePlus "/units/:unit_id/task_definitions/:task_def_id/task_resources", { unit_id: "@unit_id", task_def_id: "@task_def_id" }

  TaskDefinition
)