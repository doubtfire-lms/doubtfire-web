angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-tasks-step', [])

#
# Allows students to select which tasks they have completed can
# be included in their portfolio
#
.directive('portfolioTasksStep', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/portfolio-tasks-step/portfolio-tasks-step.tpl.html'
  controller: ($scope) ->
    $scope.unitHasILOs = $scope.unit.ilos.length > 0
    $scope.noTasksSelected = ->
      if $scope.unitHasILOs
        selectedTasks = _.filter $scope.project.tasks, (d) ->
          d.include_in_portfolio and _.find($scope.project.task_outcome_alignments, { task_id: d.id })?
        selectedTasks.length is 0
      else
        selectedTasks = _.filter $scope.project.tasks, (d) -> d.include_in_portfolio
        selectedTasks.length is 0
)
