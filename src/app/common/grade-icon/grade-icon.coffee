angular.module('doubtfire.common.grade-icon', [])

.directive 'gradeIcon', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/grade-icon/grade-icon.tpl.html'
  scope:
    inputGrade: '=?grade'
    colorful: '=?'
  controller: ($scope, gradeService) ->
    $scope.$watch 'inputGrade', (newGrade) ->
      $scope.grade = if _.isString($scope.inputGrade) then gradeService.stringToGrade($scope.inputGrade) else $scope.inputGrade
      $scope.gradeText = (grade) ->
        if grade? then gradeService.grades[grade] or "Grade"
      $scope.gradeLetter = (grade) ->
        gradeService.gradeAcronyms[grade] or 'G'
