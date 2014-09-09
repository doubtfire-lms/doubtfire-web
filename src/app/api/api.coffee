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
.factory("Tutorial", (resourcePlus) ->
  resourcePlus "/tutorials/:id", { id: "@id" }
)
.factory("Task", (resourcePlus) ->
  resourcePlus "/tasks/:id", { id: "@id" }
)
.factory("TaskDefinition", (resourcePlus) ->
  resourcePlus "/task_definitions/:id", { id: "@id" }
)
.factory("TaskFeedback", (api, currentUser, $window) ->
  this.getTaskUrl = (task) ->
    "#{api}/submission/task/#{task.id}?auth_token=#{currentUser.authenticationToken}"
  this.openFeedback = (task) ->
    $window.open this.getTaskUrl(task), "_blank"
    
  return this
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
          fileUploader.scope.users = fileUploader.scope.users.concat(response)
        else
          alertService.add("info", "No users need to be added.", 4000)
        fileUploader.clearQueue()
        
      fileUploader.onErrorItem = (item, response, status, headers) ->
        alertService.add("danger", "File Upload Failed: " + response.error, 6000)
        fileUploader.clearQueue()
    fileUploader
        
  this.downloadFile =  ->
    $window.open csvUrl, "_blank"
    
  return this
)
.service("TaskSubmission", (api, $window, FileUploader, currentUser, alertService) ->

  this.fileUploader = (scope, task, student, onChange) ->
    # per scope or task
    uploadUrl = "#{api}/submission/task/#{task.id}?auth_token=#{currentUser.authenticationToken}"
    fileUploader = new FileUploader {
      scope: scope,
      url: uploadUrl
      method: "POST",
      queueLimit: task.task_upload_requirements.length
    }
    
    fileUploader.task = task
    fileUploader.student = student
    fileUploader.onChange = onChange
    
    extWhitelist = (name, exts) ->
      # no extension
      parts = name.split('.')
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
    
    fileUploader.onUploadSuccess = (response)  ->
      alertService.add("success", "#{fileUploader.task.task_name} uploaded successfully!", 2000)
      fileUploader.scope.close()
      fileUploader.clearQueue()
      task.status = response.status

      if student? && student.task_stats?
        updateTaskStats(student, response.new_stats)

      if fileUploader.onChange?
        fileUploader.onChange()
      
    fileUploader.onUploadFailure = (response) ->
      fileUploader.scope.close(response.error)
      alertService.add("danger", "File Upload Failed: #{response.error}", 6000)
      fileUploader.clearQueue()
      
    fileUploader.uploadEnqueuedFiles = () ->
      queue = fileUploader.queue
      xhr = new XMLHttpRequest()
      form = new FormData()
      this.isUploading = true

      # Setup progress
      xhr.upload.onprogress = (event) ->
        fileUploader.progress = Math.round (if event.lengthComputable then event.loaded * 100 / event.total else 0)
        fileUploader._render()
      xhr.onreadystatechange = () ->
        if xhr.readyState == 4
          fileUploader.isUploading = false
          # Success (201 Created)
          if xhr.status == 201
            fileUploader.onUploadSuccess(JSON.parse(xhr.responseText))
          # Fail
          else
            fileUploader.onUploadFailure(JSON.parse(xhr.responseText))
            
      # Append each file in the queue to the form
      form.append item.alias, item._file for item in queue
      
      xhr.open(fileUploader.method, fileUploader.url, true)
      xhr.send(form)
        
    fileUploader
  
  this.openTaskInNewWindow = (task) ->
    win = $window.open this.getTaskUrl(task), "_blank"
    win.href = ""
    
  return this
)
.service("TaskCSV", (api, $window, FileUploader, currentUser, alertService) ->
  this.fileUploader = (scope) ->
    fileUploader = new FileUploader {
      scope: scope,
      method: "POST",
      url: "#{api}/csv/task_definitions?auth_token=#{currentUser.authenticationToken}&unit_id=0"
      queueLimit: 1
    }
    fileUploader.onBeforeUploadItem = (item) ->
      # ensure this item will be uploading for this unit it...
      item.url = fileUploader.url.replace(/unit_id=\d+/, "unit_id=#{fileUploader.unit.id}")
      
    fileUploader.uploadTaskCSV = (unit) ->
      fileUploader.unit = unit
      fileUploader.uploadAll()
      
    fileUploader.onSuccessItem = (item, response, status, headers) ->
      newTasks = response
      diff = newTasks.length - fileUploader.unit.task_definitions.length
      alertService.add("success", "Added #{newTasks.length} tasks.", 2000)
      _.extend(fileUploader.scope.unit.task_definitions, response)
      fileUploader.clearQueue()
      
    fileUploader.onErrorItem = (evt, response, item, headers) ->
      alertService.add("danger", "File Upload Failed: #{response.error}", 6000)
      fileUploader.clearQueue()
        
    fileUploader
        
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/task_definitions?auth_token=#{currentUser.authenticationToken}&unit_id=#{unit.id}", "_blank"
    
  return this
)
.service("StudentEnrolmentCSV", (api, $window, FileUploader, currentUser, alertService) ->

  this.fileUploader = (scope) ->
    fileUploader = new FileUploader {
      scope: scope,
      method: "POST",
      url: "#{api}/csv/units/0?auth_token=#{currentUser.authenticationToken}"
      queueLimit: 1
    }
    fileUploader.onBeforeUploadItem = (item) ->
      # ensure this item will be uploading for this unit it...
      item.url = fileUploader.url.replace(/\d+\?/, "#{fileUploader.unit.id}?")
      
    fileUploader.uploadStudentEnrolmentCSV = (unit) ->
      fileUploader.unit = unit
      fileUploader.uploadAll()
      
    fileUploader.onSuccessItem = (item, response, status, headers) ->
      newStudents = response
      # at least one student?
      if newStudents.length != 0
        alertService.add("success", "Enrolled #{newStudents.length} students.", 2000)
        fileUploader.scope.unit.students = fileUploader.scope.unit.students.concat(newStudents)
      else
        alertService.add("info", "No students need to be enrolled.", 4000)
      fileUploader.clearQueue()
      
    fileUploader.onErrorItem = (evt, response, item, headers) ->
      alertService.add("danger", "File Upload Failed: #{response.error}", 6000)
      fileUploader.clearQueue()
        
    fileUploader
        
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/units/#{unit.id}?auth_token=#{currentUser.authenticationToken}", "_blank"
    
  return this
)
.service("TutorMarker", (api, $window, FileUploader, currentUser, alertService) ->

  this.fileUploader = (scope) ->
    fileUploader = new FileUploader {
      scope: scope,
      method: "POST",
      url: "#{api}/submission/assess.json?unit_id=#{scope.unit.id}&auth_token=#{currentUser.authenticationToken}"
      queueLimit: 1
    }
      
    fileUploader.uploadZip = () ->
      fileUploader.uploadAll()
      
    fileUploader.onSuccessItem = (item, response, status, headers) ->
      markedTasks = response
      # at least one student?
      if markedTasks.length != 0
        alertService.add("success", "Uploaded #{markedTasks.length} marked tasks.", 2000)
      else
        alertService.add("info", "No tasks were uploaded.", 2000)
      fileUploader.clearQueue()
      
    fileUploader.onErrorItem = (evt, response, item, headers) ->
      alertService.add("danger", "File Upload Failed: #{response.error}", 6000)
      fileUploader.clearQueue()
        
    fileUploader
        
  this.downloadFile = (unit) ->
    $window.open "#{api}/submission/assess.json?unit_id=#{unit.id}&auth_token=#{currentUser.authenticationToken}"
    
  return this
)
.service("TaskCompletionCSV", (api, $window, currentUser) ->
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/units/#{unit.id}/task_completion.json?auth_token=#{currentUser.authenticationToken}", "_blank"
    
  return this
)