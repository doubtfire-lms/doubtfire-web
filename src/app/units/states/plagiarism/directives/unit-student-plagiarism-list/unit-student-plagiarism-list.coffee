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
  controller: ($scope, $filter, currentUser, gradeService, projectService) ->
    $scope.grades = gradeService.grades

    $scope.view = "students"
    studentFilter = "allStudents"

    $scope.tutorName = currentUser.profile.name
    $scope.search = ""
    $scope.reverse = false
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 5

    $scope.assessingUnitRole = $scope.unitRole

    $scope.studentFilter = 'allStudents'

    $scope.$watch 'unit.students', (newUnit) ->
      filteredStudents = $filter('showStudents')($scope.unit.students, 'myStudents', $scope.tutorName)
      if filteredStudents? && filteredStudents.length == 0
        $scope.studentFilter = 'allStudents'

      # _.each $scope.unit.students, (student) ->
      #   if student.max_pct_copy > 0
      #     projectService.getProject student, $scope.unit, (proj) ->
      #       tasksWithCpy = _.filter proj.tasks, (t) -> t.pct_similar > 0
      #       proj.similar_to_count = tasksWithCpy.length

    $scope.activeStudent = null
    $scope.activeTask = null
    $scope.loadingStudent = true

    $scope.selectStudent = (student) ->
      $scope.activeStudent = student
      $scope.loadingStudent = true
      if student
        projectService.getProject student, $scope.unit, (project) ->
          $scope.activeTask = $filter('taskWithPlagiarism')(student.tasks)[0]
          $scope.loadingStudent = false

    $scope.selectTask = (task) ->
      $scope.activeTask = task
)
