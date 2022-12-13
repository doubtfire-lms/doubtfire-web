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
.controller('UnitStudentEnrolmentModalCtrl', ($scope, $modalInstance, unit, alertService, campusService, newProjectService) ->
  $scope.unit = unit
  $scope.projects = unit.students
  $scope.campuses = []
  $scope.data = { campusId: 1 } # need in object for observing

  campusService.query().subscribe( (campuses) ->
    $scope.campuses = campuses
    $scope.data.campusId = campuses[0].id
  )

  $scope.enrolStudent = (studentId, campusId) ->
    if ! campusId?
      alertService.danger("Campus missing. Please indicate student campus")
      return

    newProjectService.create(
      {}, {
        cache: unit.studentCache
        body: {
          unit_id: unit.id,
          student_num: studentId,
          campus_id: campusId
        }
        constructorParams: unit
      }).subscribe({
        next: (project) ->
          alertService.success("Student enrolled")
          $modalInstance.close()
        error: (message) -> alertService.danger("Error enrolling student: #{message}")
      })
)
