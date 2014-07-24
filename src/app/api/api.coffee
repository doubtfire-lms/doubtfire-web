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
  resourcePlus "/convenors"
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
      fileUploader.onSuccessItem = (item, response, status, headers)  ->
        if response.length != 0
          alertService.add("success", "Added #{response.length} users.", 2000)
          fileUploader.scope.users.concat(response)
        else
          alertService.add("info", "No users need to be added.", 2000)
        fileUploader.clearQueue()
        
      fileUploader.onErrorItem = (item, response, status, headers) ->
        alertService.add("danger", "File Upload Failed: " + response.error, 2000)
        fileUploader.clearQueue()
    fileUploader
        
  this.downloadFile =  ->
    $window.open csvUrl, "_blank"
    
  return this
)
.service("TaskSubmission", (api, $window, FileUploader, currentUser, alertService) ->

  this.fileUploader = (scope, task) ->
    # per scope or task
    uploadUrl = "#{api}/submission/task/#{task.id}.json?auth_token=#{currentUser.authenticationToken}"
    fileUploader = new FileUploader {
      scope: scope,
      url: uploadUrl
      method: "POST",
      queueLimit: task.task_upload_requirements.length
    }
    
    extWhitelist = (name, exts) ->
      # no extension
      parts = name.split('.')
      return false if parts.length == 0
      ext = parts.pop()
      ext in exts

    fileUploader.filters.push {
      name: 'is_code'
      fn: (item) ->
        valid = extWhitelist item.name, ['pas', 'cpp', 'c', 'h', 'java']
        if not valid
          alertService.add("info", "#{item.name} is not a valid code file", 2000)
        valid
    }
    fileUploader.filters.push {
      name: 'is_document'
      fn: (item) ->
        valid = extWhitelist item.name, ['doc', 'docx', 'pdf']
        if not valid
          alertService.add("info", "#{item.name} is not a valid document file", 2000)
        valid
    }
    fileUploader.filters.push {
      name: 'is_image'
      fn: (item) ->
        valid = extWhitelist item.name, ['png', 'gif', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg']
        if not valid
          alertService.add("info", "#{item.name} is not a valid image file", 2000)
        valid
    }
    
    fileUploader.onSuccessItem = (item, response, status, headers)  ->
      # Open the response in a new window
      data = 'data:application/pdf;base64,' + response
      $window.open data, "_blank"
      fileUploader.clearQueue()
      
    fileUploader.onErrorItem = (item, response, status, headers) ->
      alertService.add("danger", "File Upload Failed: " + response.error, 2000)
      fileUploader.clearQueue()
    fileUploader
    
  return this
)




