angular.module('doubtfire.tasks.partials.task-admin', [])
.directive('taskAdmin', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-admin.tpl.html'
  scope:
    unit: "="
    task: "="
    isNew: "="
  controller: ($scope, $filter, taskService, gradeService, TaskDefinition, alertService) ->
    $scope.grades = gradeService.grades

    $scope.targetPicker = { open: false }
    $scope.duePicker = { open: false }

    # Datepicker opener
    $scope.open = ($event, pickerData) ->
      $event.preventDefault()
      $event.stopPropagation()

      if ! pickerData.open
        # Close both
        $scope.targetPicker.open = false
        $scope.duePicker.open = false

      # Toggle one
      pickerData.open = ! pickerData.open

    $scope.addUpReq = () ->
      newLength = $scope.task.upload_requirements.length + 1
      newUpReq = { key: "file#{newLength-1}", name: "", type: "code", language: "Pascal" }
      $scope.task.upload_requirements.push newUpReq

    $scope.removeUpReq = (upReq) ->
      $scope.task.upload_requirements = $scope.task.upload_requirements.filter (anUpReq) -> anUpReq.key isnt upReq.key

    $scope.addCheck = () ->
      newLength = $scope.task.plagiarism_checks.length + 1
      newCheck = { key: "check#{newLength-1}", pattern: "", type: "" }
      $scope.task.plagiarism_checks.push newCheck

    $scope.removeCheck = (check) ->
      $scope.task.plagiarism_checks = $scope.task.plagiarism_checks.filter (aCheck) -> aCheck.key isnt check.key

    populate_task = (oldTask, newTask) ->
      _.extend(oldTask, newTask)
      # oldTask.abbreviation = newTask.abbreviation
      # oldTask.description = newTask.description
      if newTask.weighting
        oldTask.weight = newTask.weighting
      # else
      #   oldTask.weight = newTask.weight
      # oldTask.name = newTask.name
      # oldTask.upload_requirements = newTask.upload_requirements
      # oldTask.plagiarism_checks = newTask.plagiarism_checks
      # oldTask.target_date = newTask.target_date

    $scope.deleteTask = () ->
      taskService.deleteTask($scope.task, $scope.unit, $modalInstance.close)

    $scope.saveTask = () ->
      # Map the task to upload to the appropriate fields
      task = {}
      _.extend(task, $scope.task)

      task.weighting = $scope.task.weight
      task.unit_id = $scope.unit.id
      task.upload_requirements = JSON.stringify $scope.task.upload_requirements
      task.plagiarism_checks = JSON.stringify $scope.task.plagiarism_checks
      if task.group_set
        task.group_set_id = task.group_set.id
      else
        task.group_set_id = -1

      if task.target_date && task.target_date.getMonth
        tgt = task.target_date
        task.target_date = "#{tgt.getFullYear()}-#{tgt.getMonth() + 1}-#{tgt.getDate()}"

      if task.due_date && task.due_date.getMonth
        due = task.due_date
        task.due_date = "#{due.getFullYear()}-#{due.getMonth() + 1}-#{due.getDate()}"

      if $scope.isNew
        TaskDefinition.create( { task_def: task } ).$promise.then (
          (response) ->
            $scope.unit.task_definitions.push(response)
            alertService.add("success", "#{response.name} Added", 2000)
            $scope.task = null
        ),
        (
          (response) ->
            if response.data.error?
              alertService.add("danger", "Error: " + response.data.error, 6000)
        )
      else
        TaskDefinition.update( { id: task.id, task_def: task } ).$promise.then (
          (response) ->
            populate_task($scope.task, response)
            alertService.add("success", "#{response.name} Updated", 2000)
            $scope.task = null
        ),
        (
          (response) ->
            if response.data.error?
              alertService.add("danger", "Error: " + response.data.error, 6000)
        )
)