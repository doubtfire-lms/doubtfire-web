angular.module("doubtfire.api.models.project", [])

.factory("Project", (resourcePlus) ->
  Project = resourcePlus "/projects/:id", { id: "@id" }
  Project.tutorialEnrolment = resourcePlus "/units/:id/tutorials/:tutorial_abbreviation/enrolments/:project_id", {id: "@id", tutorial_abbreviation: "@tutorial_abbreviation", project_id: "@project_id"}

  Project
)
