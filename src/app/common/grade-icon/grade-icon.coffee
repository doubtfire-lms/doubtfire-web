_ = require('underscore')

mod = angular.module('doubtfire.common.grade-icon', [])

.directive 'gradeIcon', ->
  restrict: 'E'
  replace: true
  template: require('./grade-icon.tpl.html')
  scope:
    inputGrade: '=?grade'
    colorful: '=?'
  controller: ($scope, gradeService) ->
    $scope.$watch 'inputGrade', (newGrade) ->
      $scope.grade = if _.isString($scope.inputGrade) then gradeService.grades.indexOf($scope.inputGrade) else $scope.inputGrade
      $scope.gradeText = (grade) ->
        if $scope.grade? then gradeService.grades[$scope.grade] or "Grade"
      $scope.gradeLetter = (grade) ->
        gradeService.gradeAcronyms[$scope.gradeText(grade)] or 'G'

module.exports = mod.name
