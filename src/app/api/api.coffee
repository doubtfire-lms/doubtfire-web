angular.module("doubtfire.api", [
  "ngResource"
  "ngFileUpload"
])

.constant("api", '/* @echo API_URL */') # Set in env.config.js

#
# Resource "plus"
# - base URL path
# - the addition of the authentication token
# - change save to use PUT for update and POST for create
#
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
.factory("Project", (resourcePlus) ->
  resourcePlus "/projects/:id", { id: "@id" }
)
.factory("Unit", (resourcePlus, currentUser, $window, api) ->
  Unit = resourcePlus "/units/:id", { id: "@id" }
  Unit.getPortfoliosUrl = (unit) ->
    "#{api}/submission/unit/#{unit?.id}/portfolio?auth_token=#{currentUser.authenticationToken}"
  Unit.taskUploadUrl = (unit) ->
    "#{api}/units/#{unit.id}/task_definitions/task_pdfs?auth_token=#{currentUser.authenticationToken}"
  Unit.enrolStudentsCSVUrl = (unit) ->
    "#{api}/csv/units/#{unit.id}?auth_token=#{currentUser.authenticationToken}"
  Unit.withdrawStudentsCSVUrl = (unit) ->
    "#{api}/csv/units/#{unit.id}/withdraw?auth_token=#{currentUser.authenticationToken}"

  Unit.learningProgressClassStats = resourcePlus "/units/:id/learning_alignments/class_stats", { id: "@id" }
  Unit.tasksRequiringFeedback = resourcePlus "/units/:id/feedback", { id: "@id" }
  Unit.tasksForDefinition = resourcePlus "/units/:id/task_definitions/:task_def_id/tasks", {id: "@id", task_def_id: "@task_def_id"}

  Unit
)
.factory("UnitRole", (resourcePlus) ->
  resourcePlus "/unit_roles/:id", { id: "@id" }
)
.factory("UserRole", (resourcePlus) ->
  resourcePlus "/user_roles/:id", { id: "@id" }
)
.factory("Convenor", (resourcePlus) ->
  resourcePlus "/users/convenors"
)
.factory("Tutor", (resourcePlus) ->
  resourcePlus "/users/tutors"
)
.factory("Tutorial", (resourcePlus) ->
  resourcePlus "/tutorials/:id", { id: "@id" }
)
.factory("LearningAlignments", (resourcePlus) ->
  resourcePlus "/units/:unit_id/learning_alignments/:id", { id: "@id", unit_id: "@unit_id" }
)
.factory("IntendedLearningOutcome", (resourcePlus, api, currentUser) ->
  IntendedLearningOutcome = resourcePlus "/units/:unit_id/outcomes/:id", { id: "@id", unit_id: "@unit_id" }

  IntendedLearningOutcome.getOutcomeBatchUploadUrl = (unit) ->
    "#{api}/units/#{unit.id}/outcomes/csv?auth_token=#{currentUser.authenticationToken}"

  IntendedLearningOutcome
)

.factory("Task", (resourcePlus, api, currentUser) ->
  Task = resourcePlus "/projects/:project_id/task_def_id/:task_definition_id", { project_id: "@project_id", task_definition_id: "@task_definition_id" }

  Task.summaryData = resourcePlus "/tasks/:id", { id: "@id" }

  #
  # Generates a url for the given task
  #
  Task.generateSubmissionUrl = (project, task) ->
    "#{api}/projects/#{project.project_id}/task_def_id/#{task.definition.id}/submission?auth_token=#{currentUser.authenticationToken}"

  Task.getTaskPDFUrl = (unit, task_def) ->
    "#{api}/units/#{unit.id}/task_definitions/#{task_def.id}/task_pdf.json?auth_token=#{currentUser.authenticationToken}"

  Task.getTaskResourcesUrl = (unit, task_def) ->
    "#{api}/units/#{unit.id}/task_definitions/#{task_def.id}/task_resources.json?auth_token=#{currentUser.authenticationToken}"

  Task.getTaskDefinitionBatchUploadUrl = (unit) ->
    "#{api}/csv/task_definitions?auth_token=#{currentUser.authenticationToken}&unit_id=#{unit.id}"

  Task.getTaskMarkingUrl = (unit) ->
    "#{api}/submission/assess.json?unit_id=#{unit.id}&auth_token=#{currentUser.authenticationToken}"

  Task.generateMarkingSubmissionUrl = ->

  Task
)
.factory("TaskComment", (resourcePlus) ->
  resourcePlus "/tasks/:task_id/comments/:id", { id: "@id", task_id: "@task_id" }
)
.factory("TaskDefinition", (resourcePlus) ->
  TaskDefinition = resourcePlus "/task_definitions/:id", { id: "@id" }
)
.factory("GroupMember", (resourcePlus) ->
  resourcePlus "/units/:unit_id/group_sets/:group_set_id/groups/:group_id/members/:id", { id: "@id", group_id: "@group_id", group_set_id: "@group_set_id", unit_id: "@unit_id" }
)
.factory("Group", (resourcePlus) ->
  resourcePlus "/units/:unit_id/group_sets/:group_set_id/groups/:id", { id: "@id", group_set_id: "@group_set_id", unit_id: "@unit_id" }
)
.factory("GroupSet", (resourcePlus, api, currentUser, $window) ->
  GroupSet = resourcePlus "/units/:unit_id/group_sets/:id", { id: "@id", unit_id: "@unit_id" }
  GroupSet.groupCSVUploadUrl = (unit, group_set) ->
    "#{api}/units/#{unit.id}/group_sets/#{group_set.id}/groups/csv.json?auth_token=#{currentUser.authenticationToken}"
  GroupSet.downloadCSV = (unit, group_set) ->
    $window.open "#{api}/units/#{unit.id}/group_sets/#{group_set.id}/groups/csv.json?auth_token=#{currentUser.authenticationToken}", "_blank"
  return GroupSet
)
.factory("TaskAlignment", (resourcePlus, api, currentUser, $window) ->
  TaskAlignment = {}
  TaskAlignment.taskAlignmentCSVUploadUrl = (unit, project_id) ->
    if project_id?
      "#{api}/units/#{unit.id}/learning_alignments/csv.json?project_id=#{project_id}&auth_token=#{currentUser.authenticationToken}"
    else
      "#{api}/units/#{unit.id}/learning_alignments/csv.json?auth_token=#{currentUser.authenticationToken}"
    
  TaskAlignment.downloadCSV = (unit, project_id) ->
    if project_id?
      $window.open "#{api}/units/#{unit.id}/learning_alignments/csv.json?project_id=#{project_id}&auth_token=#{currentUser.authenticationToken}", "_blank"
    else
      $window.open "#{api}/units/#{unit.id}/learning_alignments/csv.json?auth_token=#{currentUser.authenticationToken}", "_blank"
  return TaskAlignment
)
.factory("TaskFeedback", (api, currentUser, $window, resourcePlus) ->
  TaskFeedback = resourcePlus "/submission/task/:id?project_id=:project_id", { id: "@id", project_id: "@project_id" }

  TaskFeedback.getTaskUrl = (task) ->
    "#{api}/submission/task/#{task.id}?auth_token=#{currentUser.authenticationToken}"
  TaskFeedback.openFeedback = (task) ->
    $window.open TaskFeedback.getTaskUrl(task), "_blank"

  return TaskFeedback
)
.factory("TaskSimilarity", ($http, api, currentUser) ->
  get: (task, match, callback) ->
    url = "#{api}/tasks/#{task.id}/similarity/#{match}"
    $http.get(url).success ( data ) ->
      callback(data)
)
.factory("Students", (resourcePlus) ->
  resourcePlus "/students"
)
.factory("User", (resourcePlus, currentUser, api) ->
  User = resourcePlus "/users/:id", { id: "@id" }
  User.csvUrl = ->
    "#{api}/csv/users?auth_token=#{currentUser.authenticationToken}"
  return User
)
.service("TaskCompletionCSV", (api, $window, currentUser) ->
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/units/#{unit.id}/task_completion.json?auth_token=#{currentUser.authenticationToken}", "_blank"

  return this
)
.service("PortfolioSubmission", (api, $window, FileUploader, currentUser, alertService, resourcePlus) ->

  this.getPortfolioUrl = (project) ->
    "#{api}/submission/project/#{project.project_id}/portfolio?auth_token=#{currentUser.authenticationToken}"
  this.openPortfolio = (project) ->
    $window.open this.getTaskUrl(task), "_blank"

  this.fileUploader = (scope, project) ->
    # per scope or task
    uploadUrl = "#{api}/submission/project/#{project.project_id}/portfolio?auth_token=#{currentUser.authenticationToken}"
    fileUploader = new FileUploader {
      scope: scope,
      url: uploadUrl
      method: "POST",
      queueLimit: 1
    }

    fileUploader.project = project

    extWhitelist = (name, exts) ->
      # no extension
      parts = name.toLowerCase().split('.')
      return false if parts.length == 0
      ext = parts.pop()
      ext in exts

    fileFilter = (acceptList, type, item) ->
      valid = extWhitelist item.name, acceptList
      if not valid
        alertService.add("info", "#{item.name} is not a valid #{type} file (accepts <code>#{_.flatten(acceptList)}</code>)", 6000)
      valid

    fileUploader.filters.push {
      name: 'is_code'
      fn: (item) ->
        fileFilter ['pas', 'cpp', 'c', 'cs', 'h', 'java'], "code" , item
    }
    fileUploader.filters.push {
      name: 'is_document'
      fn: (item) ->
        fileFilter ['pdf'], "document" , item
    }
    fileUploader.filters.push {
      name: 'is_image'
      fn: (item) ->
        fileFilter ['png', 'gif', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg'], "image" , item
    }

    fileUploader.onBeforeUploadItem = (item) ->
      # ensure this item will be uploading for this unit it...
      item.formData = fileUploader.formData

    fileUploader.uploadPortfolioPart = (name, kind) ->
      fileUploader.formData = [ {name: name}, {kind: kind} ]
      fileUploader.uploadAll()

    fileUploader.onSuccessItem = (item, response)  ->
      alertService.add("success", "File uploaded successfully!", 2000)
      if not _.findWhere(fileUploader.project.portfolio_files, response)
        fileUploader.project.portfolio_files.push(response)
      fileUploader.clearQueue()

    fileUploader.onErrorItem = (response) ->
      alertService.add("danger", "File Upload Failed: #{response.error}")
      fileUploader.clearQueue()

    fileUploader.api = resourcePlus "/submission/project/:id/portfolio", { id: "@id" }

    fileUploader
  return this
)
