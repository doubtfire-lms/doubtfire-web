angular.module("doubtfire.api", [
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
.factory("Project", (resourcePlus) ->
  resourcePlus "/projects/:id", { id: "@id" }
)
.factory("Unit", (resourcePlus) ->
  resourcePlus "/units/:id", { id: "@id" }
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
.factory("Task", (resourcePlus) ->
  resourcePlus "/tasks/:id", { id: "@id" }
)
.factory("Students", (resourcePlus) ->
  resourcePlus "/students"
)
.factory("User", (resourcePlus) ->
  resourcePlus "/users/:id", { id: "@id" }
)
.service("UserCSV", (api, $window, FileUploader, currentUser, alertService) ->
  csvUrl = "#{api}/csv/users?auth_token=#{currentUser.authenticationToken}"
  
  fileUploader = null

  this.fileUploader = (scope) ->
    # singleton per scope
    if !fileUploader? && scope
      fileUploader = new FileUploader {
        scope: scope,
        url: csvUrl,
        method: "POST",
        queueLimit: 1
      }
      fileUploader.onSuccessItem = (evt, xhr, item, response) ->
        if response.length != 0
          alertService.add("success", "Added #{response.length} users.", 2000)
          fileUploader.scope.users.concat(response)
        else
          alertService.add("info", "No users need to be added.", 2000)
        fileUploader.clearQueue()
        
      fileUploader.onErrorItem = (evt, xhr, item, response) ->
        alertService.add("danger", "File Upload Failed: " + response.error, 2000)
        fileUploader.clearQueue()
        
    fileUploader
        
  this.downloadFile =  ->
    $window.open csvUrl, "_blank"
    
  return this
)
.service("TaskCSV", (api, $window, FileUploader, currentUser, alertService) ->

  this.fileUploader = (scope) ->
    fileUploader = new FileUploader {
      scope: scope,
      method: "POST",
      url: "#{api}/csv/tasks?auth_token=#{currentUser.authenticationToken}&unit_id=0"
      queueLimit: 1
    }
    fileUploader.onBeforeUploadItem = (item) ->
      # ensure this item will be uploading for this unit it...
      item.url = fileUploader.url.replace(/unit_id=\d+/, "unit_id=#{fileUploader.unit.id}")
      
    fileUploader.uploadTaskCSV = (unit) ->
      fileUploader.unit = unit
      fileUploader.uploadAll()
      
    fileUploader.onSuccessItem = (evt, xhr, item, response) ->
      newTasks = xhr
      diff = newTasks.length - fileUploader.unit.task_definitions.length
      alertService.add("success", "Added #{diff} tasks.", 2000)
      fileUploader.scope.unit.task_definitions = xhr
      fileUploader.clearQueue()
      
    fileUploader.onErrorItem = (evt, xhr, item, response) ->
      alertService.add("danger", "File Upload Failed: #{xhr.error}", 2000)
      fileUploader.clearQueue()
        
    fileUploader
        
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/tasks?auth_token=#{currentUser.authenticationToken}&unit_id=#{unit.id}", "_blank"
    
  return this
)
.service("StudentEnrolmentCSV", (api, $window, FileUploader, currentUser, alertService) ->

  this.fileUploader = (scope) ->
    fileUploader = new FileUploader {
      scope: scope,
      method: "POST",
      url: "#{api}/csv/units/0.json?auth_token=#{currentUser.authenticationToken}"
      queueLimit: 1
    }
    fileUploader.onBeforeUploadItem = (item) ->
      # ensure this item will be uploading for this unit it...
      item.url = fileUploader.url.replace(/\d+.json/, "#{fileUploader.unit.id}.json")
      
    fileUploader.uploadStudentEnrolmentCSV = (unit) ->
      fileUploader.unit = unit
      fileUploader.uploadAll()
      
    fileUploader.onSuccessItem = (evt, xhr, item, response) ->
      # at least one student?
      if xhr.length != 0
        alertService.add("success", "Enrolled #{xhr.length} students.", 2000)
        fileUploader.scope.unit.students.concat(xhr)
      else
        alertService.add("info", "No students need to be enrolled.", 2000)
      fileUploader.clearQueue()
      
    fileUploader.onErrorItem = (evt, xhr, item, response) ->
      alertService.add("danger", "File Upload Failed: #{xhr.error}", 2000)
      fileUploader.clearQueue()
        
    fileUploader
        
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/units/#{unit.id}.json?auth_token=#{currentUser.authenticationToken}", "_blank"
    
  return this
)
