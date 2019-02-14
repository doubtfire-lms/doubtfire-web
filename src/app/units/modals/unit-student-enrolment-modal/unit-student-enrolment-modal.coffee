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
.controller('UnitStudentEnrolmentModalCtrl', ($scope, $modalInstance, Project, unit, Students, alertService,unitService,$filter) ->
  $scope.unit = unit
  $scope.projects = unit.students
  
  # Filtering
  applyFilters = ->
    filteredStudents = $filter('showAllStudents')($scope.projects, $scope.student_num) if $scope.student_num?.trim().length > 0

  # Send initial apply filter
  applyFilters()

   # Changing search text reapplies filter
  $scope.studentIdChanged = applyFilters

  # Expose typeahead data function
  $scope.unitTypeAheadStudentData = unitService.unitTypeAheadStudentData
   
  $scope.enrolStudent = (student_num, tutorial) ->
    # get tutorial_id from tutorial_name
    Project.create {unit_id: unit.id, student_num: student_num, tutorial_id: if tutorial then tutorial.id else null },
      (project) ->
        if not unit.studentEnrolled project.project_id
          unit.addStudent project
          alertService.add("success", "Student enrolled", 2000)
          $modalInstance.close()
        else
          alertService.add("danger", "Student is already enrolled" , 2000)
          $modalInstance.close()

      , (response) ->
        alertService.add("danger", "Unable to find student. Please check the student ID, and ensure the student has logged in at least once already to ensure they have an account.", 6000)
)
