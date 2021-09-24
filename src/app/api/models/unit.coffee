angular.module("doubtfire.api.models.unit", [])

.factory("Unit", (resourcePlus, currentUser, $window, DoubtfireConstants) ->
  Unit = resourcePlus "/units/:id", { id: "@id" }
  Unit.getGradesUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit?.id}/grades"
  Unit.getPortfoliosUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/submission/unit/#{unit?.id}/portfolio"
  Unit.taskUploadUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/task_definitions/task_pdfs"
  Unit.taskSheetUploadUrl = (unit, taskDefinition) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/task_definitions/#{taskDefinition.id}/task_sheet"
  Unit.taskResourcesUploadUrl = (unit, taskDefinition) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/task_definitions/#{taskDefinition.id}/task_resources"
  Unit.taskAssessmentResourcesUploadUrl = (unit, taskDefinition) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/task_definitions/#{taskDefinition.id}/task_assessment_resources"
  Unit.allResourcesDownloadUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/all_resources"
  Unit.enrolStudentsCSVUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/csv/units/#{unit.id}"
  Unit.withdrawStudentsCSVUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/csv/units/#{unit.id}/withdraw"

  Unit.learningProgressClassStats = resourcePlus "/units/:id/learning_alignments/class_stats", { id: "@id" }
  Unit.learningProgressClassDetails = resourcePlus "/units/:id/learning_alignments/class_details", {id: "@id"}

  Unit.tasksRequiringFeedback = resourcePlus "/units/:id/feedback", { id: "@id" }
  Unit.tasksForTaskInbox = resourcePlus "/units/:id/tasks/inbox", { id: "@id" }
  Unit.tasksForDefinition = resourcePlus "/units/:id/task_definitions/:task_def_id/tasks", {id: "@id", task_def_id: "@task_def_id"}
  Unit.taskStatusCountByTutorial = resourcePlus "/units/:id/stats/task_status_pct", {id: "@id"}
  Unit.targetGradeStats = resourcePlus "/units/:id/stats/student_target_grade", {id: "@id"}
  Unit.taskCompletionStats = resourcePlus "/units/:id/stats/task_completion_stats", {id: "@id"}
  Unit.tutorialStream = resourcePlus "/units/:id/tutorial_streams/:tutorial_stream_abbr", {id: "@id", tutorial_stream_abbr: "@abbr"}

  Unit.groups = resourcePlus "/units/:id/groups", {id: "@id"}

  Unit
)
