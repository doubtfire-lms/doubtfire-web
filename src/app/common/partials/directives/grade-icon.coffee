angular.module('doubtfire.common.grade-icon', [])

.directive 'gradeIcon', ->
  restrict: 'E'
  templateUrl: 'common/partials/templates/grade-icon.tpl.html'
  scope:
    grade: '=?'
  controller: ($scope, gradeService) ->
    $scope.gradeText  = if $scope.grade? then gradeService.grades[$scope.grade] or "Grade"
    $scope.letter     = gradeService.gradeAcronyms[$scope.gradeText] or 'G'
