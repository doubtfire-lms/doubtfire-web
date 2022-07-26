angular.module('doubtfire.units.states.edit.directives.unit-tasks-editor', [])

#
# Editor for modifying the tasks in a unit
#
.directive('unitTasksEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-tasks-editor/unit-tasks-editor.tpl.html'
  controller: ($scope, $rootScope, gradeService, alertService, newTaskService, CsvResultModal, ConfirmationModal, ProgressModal, fileDownloaderService, newTaskDefinitionService) ->
    $scope.grades = gradeService.grades

    # Pagination details
    $scope.taskAdminPager = {
      currentPage: 1
      maxSize: 5
      pageSize: 5
      search: ''
      sortOrder: 'seq'
      reverse: false
    }

    $scope.taskAdminData = {
      selectedTask: null
      isNew: false
    }

    # Modal Events
    $scope.editTask = (unit, task) ->
      # if task is just a task definition, add a project_id to enable test submission.

      console.log("unit task editor - fix ability to test overseer exec")
      # unless task.project
      #   project = {project_id: unit.project_id}
      #   task.project = -> project

      # unless task.definition
      #   task.definition = {id: task.id, abbreviation: task.abbreviation, uploadRequirements: task.uploadRequirements}

      $scope.taskAdminData.selectedTask = task
      $scope.taskAdminData.isNew = false

    guessTaskAbbreviation = ->
      unit = $scope.unit
      if unit.taskDefinitions.length == 0
        "1.1P"
      else
        lastAbbr = unit.taskDefinitions[unit.taskDefinitions.length-1].abbreviation
        regex = /(.*)(\d+)(\D*)/
        match = regex.exec lastAbbr
        if match?
          "#{match[1]}#{parseInt(match[2])+1}#{match[3]}"
        else
          "#{lastAbbr}1"

    $scope.deleteTask = (task) ->
      ConfirmationModal.show "Delete Task #{task.abbreviation}",
      'Are you sure you want to delete this task? This action is final and will delete student work associated with this task.',
      ->
        $scope.unit.deleteTaskDefinition(task)
        #TODO: reinstate ProgressModal.show "Deleting Task #{task.abbreviation}", 'Please wait while student projects are updated.', promise

    $scope.createTask = ->
      abbr = guessTaskAbbreviation()
      task = newTaskDefinitionService.createInstanceFrom({}, $scope.unit)
      task.name =  "Task #{abbr}"
      task.abbreviation =  abbr
      task.description =  "New Description"
      task.startDate =  new Date()
      task.targetDate =  new Date()
      task.uploadRequirements =  []
      task.plagiarismChecks =  []
      task.weighting = 4
      task.targetGrade = 0
      task.restrictStatusUpdates = false
      task.plagiarismWarnPct =  80
      task.isGraded = false
      task.maxQualityPts = 0
      task.autoApplyExtensionBeforeDeadline = true
      task.sendNotifications = true
      task.enableSyncTimetable =  true
      task.enableSyncEnrolments =  true
      task.tutorialStream = $scope.unit.tutorialStreams[0]

      $scope.taskAdminData.selectedTask = task
      $scope.taskAdminData.isNew = true

    # Watch for deletion
    $scope.$watch 'unit.taskDefinitions.length', (newLength, oldLength) ->
      # Return if equal
      return if newLength == oldLength

      if $scope.unit.taskDefinitions.length > 0
        # Delete
        if newLength < oldLength
          $scope.editTask($scope.unit, _.first $scope.unit.taskDefinitions)
        else
          $scope.editTask($scope.unit, _.last $scope.unit.taskDefinitions)
      else
        $scope.taskAdminData.selectedTask = null

    $scope.taskFiles = { file: { name: 'Task PDFs', type: 'zip'  } }
    $scope.taskUploadUrl = $scope.unit.taskUploadUrl

    $scope.onTaskPDFSuccess = (response) ->
      CsvResultModal.show "Task File Import Results", response
      if response.success.length > 0
        $scope.unit.refresh()

    $scope.batchFiles = { file: { name: 'CSV Data', type: 'csv'  } }

    $scope.batchTaskUrl = ->
      $scope.unit.getTaskDefinitionBatchUploadUrl()

    $scope.downloadAllResource = ->
      fileDownloaderService.downloadFile($scope.unit.allResourcesDownloadUrl, "#{$scope.unit.code}-all-resources.zip")

    $scope.downloadTasksCSV = ->
      fileDownloaderService.downloadFile($scope.unit.getTaskDefinitionBatchUploadUrl(), "#{$scope.unit.code}-task-definitions.csv")

    $scope.onBatchTaskSuccess = (response) ->
      CsvResultModal.show "Task CSV Upload Results", response
      if response.success.length > 0
        $scope.unit.refresh()

    $scope.groupSetName = (id) -> $scope.unit.groupSetsCache.get(id)?.name || "Individual Work"
)
