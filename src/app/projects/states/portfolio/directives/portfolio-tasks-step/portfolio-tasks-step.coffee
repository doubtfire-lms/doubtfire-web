angular.module('doubtfire.projects.states.portfolio.directives.portfolio-tasks-step', [])

#
# Allows students to select which tasks they have completed can
# be included in their portfolio
#
.directive('portfolioTasksStep', ->
  restrict: 'E'
  replace: true
  templateUrl: 'projects/states/portfolio/directives/portfolio-tasks-step/portfolio-tasks-step.tpl.html'
  controller: ($scope) ->
    $scope.noTasksSelected = ->
      $scope.selectedTasks().length is 0
)
