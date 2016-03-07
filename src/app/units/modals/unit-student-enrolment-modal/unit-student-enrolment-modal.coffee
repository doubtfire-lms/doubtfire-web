angular.module('doubtfire.units.modals.unit-student-enrolment-modal', [])
#
# Modal to enrol a student in the given tutorial
#
.factory('UnitStudentEnrolmentModal', ($modal) ->
  UnitStudentEnrolmentModal = {}

  # Must provide unit
  UnitStudentEnrolmentModal.show = (unit) ->
    $modal.open
      controller: 'UnitStudentEnrolmentModalCtrl'
      templateUrl: 'units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.tpl.html'
      resolve: {
        unit: -> unit
      }

  UnitStudentEnrolmentModal
)
.controller('UnitStudentEnrolmentModalCtrl', ($scope, $modalInstance, Project, unit, alertService) ->
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
