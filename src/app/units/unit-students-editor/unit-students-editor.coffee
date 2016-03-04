angular.module('doubtfire.units.unit-students-editor', [])

.directive('enrolStudentsContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/enrol-student-context.tpl.html'
  controller: ($scope, Unit, Project, CSVResultModal, UnitStudentEnrolmentModal, alertService) ->
    $scope.activeBatchStudentType = 'enrol' # Enrol by default

    $scope.showEnrolModal = () ->
      UnitStudentEnrolmentModal.show $scope.unit

    onBatchEnrolSuccess = (response) ->
      newStudents = response
      # at least one student?
      CSVResultModal.show("Enrol Student CSV Results", response)
      if response.success.length > 0
        $scope.unit.refreshStudents()

    onBatchWithdrawSuccess = (response) ->
      CSVResultModal.show("Withdraw Student CSV Results", response)
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
