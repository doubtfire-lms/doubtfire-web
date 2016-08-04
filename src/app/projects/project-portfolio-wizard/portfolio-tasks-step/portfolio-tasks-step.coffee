mod = angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-tasks-step', [])

#
# Allows students to select which tasks they have completed can
# be included in their portfolio
#
.directive('portfolioTasksStep', ->
  restrict: 'E'
  template: require('./portfolio-tasks-step.tpl.html')
  controller: ($scope) ->
    $scope.noTasksSelected = ->
      $scope.selectedTasks().length is 0
)

module.exports = mod.name
