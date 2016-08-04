mod = angular.module('doubtfire.units.modals.unit-student-enrolment-modal', [])
#
# Modal to enrol a student in the given tutorial
#
.factory('UnitStudentEnrolmentModal', ($uibModal) ->
  UnitStudentEnrolmentModal = {}

  # Must provide unit
  UnitStudentEnrolmentModal.show = (unit) ->
    $uibModal.open
      controller: 'UnitStudentEnrolmentModalCtrl'
      template: require('./unit-student-enrolment-modal.tpl.html')
      resolve: {
        unit: -> unit
      }

  UnitStudentEnrolmentModal
)
.controller('UnitStudentEnrolmentModalCtrl', ($scope, $uibModalInstance, Project, unit, alertService) ->
  $scope.unit = unit
  $scope.projects = unit.students

  $scope.enrolStudent = (student_id, tutorial) ->
    # get tutorial_id from tutorial_name
    Project.create {unit_id: unit.id, student_num: student_id, tutorial_id: if tutorial then tutorial.id else null },
      (project) ->
        if not unit.studentEnrolled project.project_id
          unit.addStudent project
          alertService.add("success", "Student enrolled", 2000)
          $uibModalInstance.close()
        else
          alertService.add("danger", "Student is already enrolled", 2000)
          $uibModalInstance.close()

      , (response) ->
        alertService.add("danger", "Unable to find student. Ensure they have an account.", 6000)
)

module.exports = mod.name
