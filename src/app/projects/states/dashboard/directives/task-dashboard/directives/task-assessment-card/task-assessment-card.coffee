angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-assessment-card', [])
#
# Shows quality stars and graded task information
#
.directive('taskAssessmentCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, newTaskService, gradeService) ->
    # Expose grade names
    $scope.gradeNames = gradeService.grades

    $scope.hasBeenGivenStars = (t) ->
      t? && (t.qualityPts > 0 || _.includes(newTaskService.gradeableStatuses, t.status))

    $scope.hasBeenGraded = (t) ->
      t? && (_.isNumber(t.grade))
)
