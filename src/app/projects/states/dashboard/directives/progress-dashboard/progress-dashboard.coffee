angular.module('doubtfire.projects.states.dashboard.directives.progress-dashboard', [])
#
# Summary dashboard showing some graphs and way to change the
# current target grade
#
.directive('progressDashboard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/progress-dashboard/progress-dashboard.tpl.html'
  scope:
    project: '='
  controller: ($scope, projectService, taskService, gradeService) ->
    # Number of tasks completed and remaining
    completedTasks = projectService.tasksByStatus($scope.project, taskService.acronymKey.COM).length
    $scope.numberOfTasks =
      completed: completedTasks
      remaining: projectService.tasksInTargetGrade($scope.project).length - completedTasks
    # Expose grade names
    $scope.gradeNames = gradeService.grades
)
