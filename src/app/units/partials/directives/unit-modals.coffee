angular.module('doubtfire.units.partials.modals', [])
.controller('TutorialModalCtrl', ($scope, $modalInstance,  tutorial, isNew, tutors, unit, Tutorial, alertService) ->
  $scope.tutorial = tutorial
  $scope.isNew = isNew
  $scope.tutors = tutors

  $scope.saveTutorial = ->
    save_data = _.omit(tutorial, 'tutor', 'tutor_name', 'meeting_time', 'data')
    save_data.tutor_id = tutorial.tutor.user_id

    if tutorial.meeting_time.getHours
      save_data.meeting_time = tutorial.meeting_time.getHours() + ":" + tutorial.meeting_time.getMinutes()

    if isNew
      save_data.unit_id = unit.id
      Tutorial.create( tutorial: save_data ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          unit.tutorials.push(response)
          alertService.add("success", "Tutorial Added", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
    else
      Tutorial.update( { id: tutorial.id, tutorial: save_data } ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          tutorial.tutor = response.tutor
          tutorial.tutor_name = response.tutor_name
          alertService.add("success", "Tutorial Updated", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
)
.controller('UnitModalCtrl', ($scope, $modalInstance, Unit, convenors, unit) ->
  $scope.unit = unit
  $scope.modalState = {}
  $scope.availableConvenors = angular.copy(convenors)

  $scope.addSelectedConvenor = ->
    # Rip out the convenor to add and clear the input
    convenor = $scope.modalState.selectedConvenor
    $scope.modalState.selectedConvenor = null

    # Add the convenor to the list and remove it
    # from the list of available convenors
    $scope.unit.convenors.push(convenor)
    $scope.availableConvenors = _.without $scope.availableConvenors, convenor

  $scope.removeConvenor = (convenor) ->
    $scope.unit.convenors = _.without $scope.unit.convenors, convenor
    $scope.availableConvenors.push(convenor)

  $scope.saveUnit = ->
    Unit.create { unit: $scope.unit }
)
.controller('EnrolStudentModalCtrl', ($scope, $modalInstance, Project, unit, alertService) ->
  $scope.unit = unit
  $scope.projects = unit.students

  $scope.enrolStudent = (student_id, tutorial) ->
    # get tutorial_id from tutorial_name
    Project.create {unit_id: unit.id, student_num: student_id, tutorial_id: if tutorial then tutorial.id else null },
      (project) ->
        unit.addStudent project
        $modalInstance.close()
        alertService.add("success", "Student enrolled", 2000)
      , (response) ->
        alertService.add("danger", "Unable to find student. Ensure they have an account.", 6000)
)
.controller('TaskEditModalCtrl', ($scope, $modalInstance, TaskDefinition, task, unit, alertService, isNew, gradeService) ->
  $scope.unit = unit
  $scope.task = task
  $scope.isNew = isNew

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
    oldTask.abbreviation = newTask.abbreviation
    oldTask.description = newTask.description
    if newTask.weighting
      oldTask.weight = newTask.weighting
    else
      oldTask.weight = newTask.weight
    oldTask.name = newTask.name
    oldTask.upload_requirements = newTask.upload_requirements
    oldTask.plagiarism_checks = newTask.plagiarism_checks
    oldTask.target_date = newTask.target_date

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

    if $scope.isNew
      TaskDefinition.create( { task_def: task } ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          $scope.unit.task_definitions.push(response)
          alertService.add("success", "#{response.name} Added", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
    else
      TaskDefinition.update( { id: task.id, task_def: task } ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          populate_task($scope.task, response)
          alertService.add("success", "#{response.name} Updated", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )

)

.controller('IloModalCtrl', ($scope, $modalInstance, ilo, isNew, unit, IntendedLearningOutcome, alertService) ->
  $scope.ilo = ilo
  $scope.isNew = isNew

  $scope.saveILO = ->
    save_data = {
      unit_id: unit.id
      name: ilo.name
      description: ilo.description
      abbreviation: ilo.abbreviation
    }

    if isNew
      IntendedLearningOutcome.create(save_data,
        (response) ->
          $modalInstance.close(response)
          unit.ilos.push(response)
          alertService.add("success", "Intended Learning Outcome Added", 2000)
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
    else
      save_data.id = ilo.id
      IntendedLearningOutcome.update(save_data).$promise.then (
        (response) ->
          $modalInstance.close(response)
          alertService.add("success", "Intended Learning Outcome Updated", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
)

