angular.module('doubtfire.units.states.edit.directives.unit-students-editor', [])

#
# Editor to enrol students into a unit
#
.directive('unitStudentsEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-students-editor/unit-students-editor.tpl.html'
  controller: ($scope, Unit, Project, CsvResultModal, UnitStudentEnrolmentModal, alertService) ->
    $scope.activeBatchStudentType = 'enrol' # Enrol by default

    $scope.showEnrolModal = ->
      UnitStudentEnrolmentModal.show $scope.unit

    $scope.switchToTutorial = (student, tutorial) ->
      student.switchToTutorial(tutorial)

    onBatchEnrolSuccess = (response) ->
      newStudents = response
      # at least one student?
      CsvResultModal.show("Enrol Student CSV Results", response)
      if response.success.length > 0
        $scope.unit.refreshStudents()

    onBatchWithdrawSuccess = (response) ->
      CsvResultModal.show("Withdraw Student CSV Results", response)
      if response.success.length > 0
        alertService.add("success", "Withdrew #{response.success.length} students.", 2000)
        $scope.unit.refreshStudents()
      else
        alertService.add("info", "No students need to be withdrawn.", 4000)

    $scope.batchStudentTypes =
      enrol:
        batchUrl: -> Unit.enrolStudentsCSVUrl $scope.unit
        batchFiles: { file: { name: 'Enrol CSV Data', type: 'csv'  } }
        onSuccess: onBatchEnrolSuccess
      withdraw:
        batchUrl: -> Unit.withdrawStudentsCSVUrl $scope.unit
        batchFiles: { file: { name: 'Withdraw CSV Data', type: 'csv'  } }
        onSuccess: onBatchWithdrawSuccess

    changeEnrolment = (student, value) ->
      Project.update { id: student.project_id, enrolled: value },
        (project) ->
          if value == project.enrolled
            alertService.add("success", "Enrolment changed.", 2000)
          else
            alertService.add("danger", "Enrolment change failed.", 5000)
          student.enrolled = project.enrolled
        (response) ->
          alertService.add("danger", response.data.error, 5000)

    $scope.withdraw = (student) ->
      changeEnrolment(student, false)
    $scope.enrol = (student) ->
      changeEnrolment(student, true)

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15
)
