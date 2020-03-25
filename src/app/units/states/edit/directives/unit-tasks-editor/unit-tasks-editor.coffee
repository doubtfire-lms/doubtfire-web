angular.module('doubtfire.units.states.edit.directives.unit-tasks-editor', [])

#
# Editor for modifying the tasks in a unit
#
.directive('unitTasksEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-tasks-editor/unit-tasks-editor.tpl.html'
  controller: ($scope, $rootScope, Task, Unit, gradeService, alertService, taskService, groupService, CsvResultModal, ConfirmationModal, ProgressModal) ->
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
    $scope.editTask = (task) ->
      $scope.taskAdminData.selectedTask = task
      $scope.taskAdminData.isNew = false

    guessTaskAbbreviation = ->
      unit = $scope.unit
      if unit.task_definitions.length == 0
        "1.1P"
      else
        last_abbr = unit.task_definitions[unit.task_definitions.length-1].abbreviation
        regex = /(.*)(\d+)(\D*)/
        match = regex.exec last_abbr
        if match?
          "#{match[1]}#{parseInt(match[2])+1}#{match[3]}"
        else
          "#{last_abbr}1"

    $scope.deleteTask = (task) ->
      taskService.deleteTask task, $scope.unit, null

    $scope.createTask = ->
      abbr = guessTaskAbbreviation()
      task = {
        name: "Task #{abbr}",
        abbreviation: abbr,
        description: "New Description",
        start_date: new Date(),
        target_date: new Date(),
        upload_requirements: [],
        plagiarism_checks: []
        weight: 4
        target_grade: 0
        restrict_status_updates: false
        plagiarism_warn_pct: 80
        is_graded: false
        max_quality_pts: 0
        auto_apply_extension_before_deadline: true
        send_notifications: true
        tutorial_stream: $scope.unit.tutorial_streams[0]?.abbreviation
      }
      $scope.taskAdminData.selectedTask = task
      $scope.taskAdminData.isNew = true

    # Watch for deletion
    $scope.$watch 'unit.task_definitions.length', (newLength, oldLength) ->
      # Return if equal
      return if newLength == oldLength

      if $scope.unit.task_definitions.length > 0
        # Delete
        if newLength < oldLength
          $scope.editTask _.first $scope.unit.task_definitions
        else
          $scope.editTask _.last $scope.unit.task_definitions
      else
        $scope.taskAdminData.selectedTask = null

    $scope.taskFiles = { file: { name: 'Task PDFs', type: 'zip'  } }
    $scope.taskUploadUrl = Unit.taskUploadUrl($scope.unit)

    $scope.onTaskPDFSuccess = (response) ->
      CsvResultModal.show "Task File Import Results", response
      if response.success.length > 0
        $scope.unit.refresh()

    $scope.batchFiles = { file: { name: 'CSV Data', type: 'csv'  } }
    $scope.batchTaskUrl = ->
      Task.getTaskDefinitionBatchUploadUrl($scope.unit)
    $scope.allResourceUrl = ->
      Unit.allResourcesDownloadUrl($scope.unit)

    $scope.onBatchTaskSuccess = (response) ->
      CsvResultModal.show "Task CSV Upload Results", response
      if response.success.length > 0
        $scope.unit.refresh()

    $scope.groupSetName = (id) -> groupService.groupSetName(id, $scope.unit)
)
