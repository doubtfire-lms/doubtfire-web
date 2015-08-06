angular.module('doubtfire.common.grade-icon', [])

.directive 'gradeIcon', ->
  restrict: 'E'
  templateUrl: 'common/partials/templates/grade-icon.tpl.html'
  scope:
    grade: '=?'
  controller: ($scope, gradeService) ->
    $scope.gradeText = (grade) ->
      if $scope.grade? then gradeService.grades[$scope.grade] or "Grade"
    $scope.gradeLetter = (grade) ->
      gradeService.gradeAcronyms[$scope.gradeText(grade)] or 'G'
