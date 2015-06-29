angular.module('doubtfire.units.partials.unit-plagiarism',[])

.directive('unitPlagiarismTab', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-plagiarism-tab.tpl.html'
  controller: ($scope, $filter, currentUser, gradeService) ->
    $scope.grades = gradeService.grades

    $scope.view = "all-students"
    studentFilter = "allStudents"

    $scope.tutorName = currentUser.profile.name
    $scope.search = ""
    $scope.reverse = false
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15

    $scope.assessingUnitRole = $scope.unitRole

    $scope.setActiveView = (kind) ->
      $scope.view = kind
      if kind == 'my-students'
        studentFilter = "myStudents"
      else
        studentFilter = "allStudents"
      
)