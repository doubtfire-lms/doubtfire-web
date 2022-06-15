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
.controller('UnitStudentEnrolmentModalCtrl', ($scope, $modalInstance, Project, unit, alertService, campusService) ->
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
      alertService.add('danger', 'Campus missing. Please indicate student campus', 5000)
      return
    Project.create {unit_id: unit.id, student_num: studentId, campus_id: campusId },
      (project) ->
        if ! unit.studentEnrolled project.id
          unit.addStudent project
          alertService.add("success", "Student enrolled", 2000)
          $modalInstance.close()
        else
          alertService.add("danger", "Student is already enrolled", 2000)
          $modalInstance.close()
      (response) ->
        alertService.add("danger", "Error enrolling student: #{response.data.error}", 6000)
)
