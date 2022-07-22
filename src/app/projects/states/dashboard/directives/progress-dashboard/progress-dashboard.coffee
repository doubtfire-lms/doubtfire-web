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
    onUpdateTargetGrade: '='
  controller: ($scope, $stateParams, newProjectService, gradeService, analyticsService, alertService) ->
    # Is the current user a tutor?
    $scope.tutor = $stateParams.tutor
    # Number of tasks completed and remaining
    updateTaskCompletionValues  = ->
      completedTasks = $scope.project.numberTasks("complete")
      $scope.numberOfTasks =
        completed: completedTasks
        remaining: $scope.project.activeTasks().length - completedTasks
    updateTaskCompletionValues()

    # Expose grade names and values
    $scope.grades =
      names: gradeService.grades
      values: gradeService.gradeValues

    $scope.updateTargetGrade = (newGrade) ->
      $scope.project.targetGrade = newGrade
      newProjectService.update($scope.project).subscribe(
        (project) ->
          project.refreshBurndownChartData()

          # Update task completions and re-render task status graph
          updateTaskCompletionValues()
          $scope.renderTaskStatusPieChart?()
          $scope.onUpdateTargetGrade?()
          analyticsService.event("Student Project View - Progress Dashboard", "Grade Changed", $scope.grades.names[newGrade])
          alertService.add("success", "Updated target grade successfully", 2000)

        (failure) ->
          alertService.add("danger", "Failed to update target grade", 4000)
      )
)
