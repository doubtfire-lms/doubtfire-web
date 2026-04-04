angular.module('doubtfire.projects.project-progress-dashboard',[])

#
# Progress tab for the student's project
#
# Basically a dashboard where students can see everything about their
# project in one area including burndown chart, tasks to work on
# and their target grade
#
.directive('projectProgressDashboard', ->
  restrict: 'E'
  templateUrl: 'projects/project-progress-dashboard/project-progress-dashboard.tpl.html'
  # Explicit bindings for use inside upgraded Angular hosts (f-portfolios). Link copies from
  # $parent when attributes are omitted so legacy templates without project="..." still work.
  scope:
    project: '<'
    unit: '<'
  controller: ($scope, $state, $rootScope, $stateParams, newProjectService, alertService, gradeService, newTaskService, listenerService) ->
    $scope.grades = gradeService.grades

    $scope.currentVisualisation = 'burndown'

    $scope.taskStats = {}

    updateTaskCompletionStats = ->
      return unless $scope.project?
      $scope.taskStats.numberOfTasksCompleted = $scope.project.tasksByStatus(newTaskService.completeStatus).length
      $scope.taskStats.numberOfTasksRemaining = $scope.project.activeTasks().length - $scope.taskStats.numberOfTasksCompleted

    syncStudentProjectId = ->
      if $stateParams.projectId?
        $scope.studentProjectId = $stateParams.projectId
      else if $scope.project?
        $scope.studentProjectId = $scope.project.id

    $scope.chooseGrade = (idx) ->
      return unless $scope.project?
      $scope.project.targetGrade = idx
      newProjectService.update($scope.project).subscribe(
        (response) ->
          alertService.success( "Target updated")
      )
      updateTaskCompletionStats()

    $scope.taskCount = ->
      $scope.unit?.taskDefinitionCount

    $scope.$on 'TaskStatusUpdated', ->
      updateTaskCompletionStats()

    $scope.$watch 'project', (project) ->
      return unless project?
      syncStudentProjectId()
      updateTaskCompletionStats()

  link: (scope, _el, _attrs) ->
    unless scope.project?
      scope.project = scope.$parent.project if scope.$parent?
    unless scope.unit?
      scope.unit = scope.$parent.unit if scope.$parent?
)
