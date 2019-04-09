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
  controller: ($scope, $stateParams, projectService, taskService, gradeService, analyticsService, alertService) ->
    # Is the current user a tutor?
    $scope.tutor = $stateParams.tutor
    # Number of tasks completed and remaining
    updateTaskCompletionValues  = ->
      completedTasks = projectService.tasksByStatus($scope.project, taskService.acronymKey.COM).length
      $scope.numberOfTasks =
        completed: completedTasks
        remaining: projectService.tasksInTargetGrade($scope.project).length - completedTasks
    updateTaskCompletionValues()
    # Expose grade names and values
    $scope.grades =
      names: gradeService.grades
      values: gradeService.gradeValues
    $scope.updateTargetGrade = (newGrade) ->
      projectService.updateProject($scope.project.project_id, { target_grade: newGrade },
        (project) ->
          $scope.project.burndown_chart_data = project.burndown_chart_data
          $scope.project.updateTaskStats(project.stats)
          # Update task completions and re-render task status graph
          updateTaskCompletionValues()
          $scope.renderTaskStatusPieChart?()
          $scope.onUpdateTargetGrade?()
          analyticsService.event("Student Project View - Progress Dashboard", "Grade Changed", $scope.grades.names[newGrade])
          alertService.add("info", "Updated target grade successfully", 2000)
        (failure) ->
          alertService.add("danger", "Failed to update target grade", 4000)
      )
)
