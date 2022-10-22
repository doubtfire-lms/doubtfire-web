angular.module('doubtfire.tasks.task-definition-editor', [])

#
# Allows the creation and modification of task definitions
#
.directive('taskDefinitionEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-definition-editor/task-definition-editor.tpl.html'
  scope:
    unit: "="
    task: "="
    isNew: "="
  controller: ($scope, $filter, DoubtfireConstants, ConfirmationModal, gradeService, newTaskDefinitionService, alertService, ProgressModal, TaskSubmission, fileDownloaderService) ->
    $scope.overseerEnabled = DoubtfireConstants.IsOverseerEnabled

    $scope.grades = gradeService.grades

    $scope.targetPicker = { open: false }
    $scope.duePicker = { open: false }
    $scope.startPicker = { open: false }

    # Get docker images available for automated task assessment for the unit.
    TaskSubmission.getDockerImagesAsPromise().then (images) ->
      $scope.dockerImages = images

    # Get the confugurable, external name of Doubtfire
    $scope.externalName = DoubtfireConstants.ExternalName

    #
    # Active task tab group
    #
    $scope.taskAdmin =
      tabsData:
        taskSheet:
          title: "Task Description"
          subtitle: "Provide the descriptive details for this task"
          icon: "fa-info"
          seq: 0
          active: false
        rareSettings:
          title: "Other Settings"
          subtitle: "Adjust settings to customise task interaction"
          icon: "fa-adjust"
          seq: 1
          active: false
        fileUpload:
          title: "Submission Details"
          subtitle: "Indicate what files students need to submit for this task"
          icon: "fa-upload"
          seq: 2
          active: false
        taskResources:
          title: "Task Resources"
          subtitle: "Upload the task sheet and other resources for this task"
          icon: "fa-file-o"
          seq: 3
          active: false
        plagiarismChecks:
          title: "Plagiarism Detection"
          subtitle: "Add plagiarism checks for this task"
          icon: "fa-eye"
          seq: 4
          active: false

    if $scope.overseerEnabled.value
      $scope.taskAdmin.tabsData.taskAssessmentResources = {
        title: "Task Assessment Resources"
        subtitle: "Upload the bash script and other resources for this task assessment"
        icon: "fa-wpforms"
        seq: 5
        active: false}

    #
    # The task sheet uploader...
    #
    $scope.taskSheet = { file: { name: 'Task Sheet', type: 'document'  } }
    $scope.taskSheetUploadUrl = -> $scope.task.taskSheetUploadUrl

    $scope.onTaskSheetSuccess = (response) ->
      alertService.add("success", "Task sheet uploaded", 2000)
      $scope.task.hasTaskSheet = true

    # Assign task the stream - this is called
    # From the template as you can't ngModel
    # With dropdown
    $scope.changeTaskStream = (task, stream) ->
      task.tutorialStream = stream

    $scope.downloadTaskPDFUrl = ->
      fileDownloaderService.downloadFile($scope.task.getTaskPDFUrl())

    $scope.downloadTaskResources = ->
      fileDownloaderService.downloadFile($scope.task.getTaskResourcesUrl(true), "#{$scope.task.abbreviation}-task-sheet.pdf")

    $scope.removeTaskSheet = (task) ->
      task.deleteTaskSheet().subscribe({
        next: (success) -> alertService.add("success", "Deleted task sheet", 2000)
        error: (message) ->alertService.add("danger", message, 6000)
      })

    $scope.removeTaskResources = (task) ->
      task.deleteTaskResources().subscribe({
        next: (success) -> alertService.add("success", "Deleted task resources", 2000)
        error: (message) ->alertService.add("danger", message, 6000)
      })

    $scope.removeTaskAssessmentResources = (task) ->
      task.deleteTaskAssessmentResources().subscribe({
        next: (success) -> alertService.add("success", "Deleted task assessment resources", 2000)
        error: (message) ->alertService.add("danger", message, 6000)
      })

    #
    # The task resources uploader...
    #
    $scope.taskResources = { file: { name: 'Task Resources', type: 'zip' } }
    $scope.taskResourcesUploadUrl = -> $scope.task.taskResourcesUploadUrl

    $scope.onTaskResourcesSuccess = (response) ->
      alertService.add("success", "Task sheet uploaded", 2000)
      $scope.task.hasTaskResources = true

    $scope.resourceUrl = ->
      $scope.task.getTaskResourcesUrl()


    # #
    # # The assessment resources uploader...
    # #
    $scope.taskAssessmentResources = { file: { name: 'Task Assessment Resources', type: 'zip' } }
    $scope.taskAssessmentResourcesUploadUrl = -> $scope.task.taskAssessmentResourcesUploadUrl

    $scope.onTaskAssessmentResourcesSuccess = (response) ->
      alertService.add("success", "Task assessment resources uploaded", 2000)
      $scope.task.hasTaskAssessmentResources = true

    $scope.downloadTaskAssessmentResources = ->
      fileDownloaderService.downloadFile($scope.task.getTaskAssessmentResourcesUrl(), "#{$scope.unit.code}-#{$scope.task.abbreviation}-task-assessment-resources.zip")

    #
    # Sets the active tab
    #
    $scope.setActiveTab = (tab) ->
      # Do nothing if we're switching to the same tab
      return if tab is $scope.activeTab
      if $scope.activeTab?
        $scope.activeTab.active = false
      $scope.activeTab = tab
      $scope.activeTab.active = true

    #
    # Checks if tab is the active tab
    #
    $scope.isActiveTab = (tab) ->
      tab is $scope.activeTab

    $scope.setActiveTab($scope.taskAdmin.tabsData['taskSheet'])

    # Datepicker opener
    $scope.open = ($event, pickerData) ->
      $event.preventDefault()
      $event.stopPropagation()

      unless pickerData.open
        # Close both
        $scope.targetPicker.open = false
        $scope.duePicker.open = false
        $scope.startPicker.open = false

      # Toggle one
      pickerData.open = ! pickerData.open

    $scope.addUpReq = ->
      newLength = $scope.task.uploadRequirements.length + 1
      newUpReq = { key: "file#{newLength-1}", name: "", type: "code", language: "Pascal" }
      $scope.task.uploadRequirements.push newUpReq

    $scope.removeUpReq = (upReq) ->
      $scope.task.uploadRequirements = $scope.task.uploadRequirements.filter (anUpReq) -> anUpReq.key isnt upReq.key

    $scope.addCheck = ->
      newLength = $scope.task.plagiarismChecks.length + 1
      newCheck = { key: "check#{newLength-1}", pattern: "", type: "" }
      $scope.task.plagiarismChecks.push newCheck

    $scope.removeCheck = (check) ->
      $scope.task.plagiarismChecks = $scope.task.plagiarismChecks.filter (aCheck) -> aCheck.key isnt check.key

    $scope.allowedQualityPoints = [0..10]

    $scope.deleteTask = ->
      ConfirmationModal.show "Delete Task #{$scope.task.abbreviation}",
      'Are you sure you want to delete this task? This action is final and will delete student work associated with this task.',
      ->
        $scope.unit.deleteTaskDefinition($scope.task)
        # TODO: reinstate ProgressModal.show "Deleting Task #{task.abbreviation}", 'Please wait while student projects are updated.', promise

    $scope.saveTask = ->
      if $scope.isNew
        # TODO: add progress modal
        newTaskDefinitionService.create({unitId: $scope.unit.id}, {entity: $scope.task, cache: $scope.unit.taskDefinitionCache, constructorParams: $scope.unit} ).subscribe({
          next: (response) -> alertService.add("success", "Task Added", 2000)
          error: (message) -> alertService.add("danger", message, 6000)
        })
      else
        newTaskDefinitionService.update( {unitId: $scope.unit.id, id: $scope.task.id}, {entity: $scope.task} ).subscribe({
          next: (response) -> alertService.add("success", "Task Updated", 2000)
          error: (message) -> alertService.add("danger", message, 6000)
        })
)
