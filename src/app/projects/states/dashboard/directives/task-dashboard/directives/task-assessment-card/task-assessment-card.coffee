angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-assessment-card', [])
#
# Shows quality stars and graded task information
#
.directive('taskAssessmentCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, taskService, listenerService, gradeService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Evaluate required assessment
    reapplyAssessmentCards = ->
      $scope.assessmentCards = {
        isGradedTask: $scope.task.definition.is_graded
        hasBeenGraded: _.isNumber($scope.task.grade)
        isQualityStarTask: $scope.task.definition.max_quality_pts > 0
        hasBeenGivenStars: $scope.task.quality_pts > 0 || _.includes(taskService.markedStatuses, $scope.task.status)
      }
    # Required changes when task changes
    listeners.push $scope.$watch('task.id', ->
      return unless $scope.task?
      reapplyAssessmentCards()
    )
    # Expose grade names
    $scope.gradeNames = gradeService.grades
)
