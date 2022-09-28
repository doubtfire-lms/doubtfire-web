angular.module('doubtfire.units.states.plagiarism.directives.unit-student-plagiarism-list',[])

#
# List of all possible Similarities detected in student's work
#
.directive('unitStudentPlagiarismList', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/plagiarism/directives/unit-student-plagiarism-list/unit-student-plagiarism-list.tpl.html'
  scope:
    unit: '='
    unitRole: '='
  controller: ($scope, $filter, gradeService, newProjectService, newUserService, alertService) ->
    $scope.grades = gradeService.grades

    $scope.view = "students"
    studentFilter = "allStudents"

    $scope.tutor = newUserService.currentUser
    $scope.search = ""
    $scope.reverse = false
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 5

    $scope.assessingUnitRole = $scope.unitRole

    $scope.studentFilter = 'allStudents'

    # $scope.$watch 'unit.students', (newUnit) ->
    #   filteredStudents = $filter('showStudents')($scope.unit.students, 'myStudents', $scope.tutor)
    #   if filteredStudents? && filteredStudents.length == 0
    #     $scope.studentFilter = 'allStudents'

    $scope.activeStudent = null
    $scope.activeTask = null
    $scope.loadingStudent = true

    $scope.selectStudent = (student) ->
      $scope.activeStudent = student
      $scope.loadingStudent = true
      if student
        newProjectService.loadProject(student, $scope.unit).subscribe({
          next: (project) ->
            $scope.activeTask = $filter('taskWithPlagiarism')(student.tasks)[0]
            $scope.loadingStudent = false
          error: (message) -> alertService.add("danger", message, 6000)
        })

    $scope.selectTask = (task) ->
      $scope.activeTask = task
)
