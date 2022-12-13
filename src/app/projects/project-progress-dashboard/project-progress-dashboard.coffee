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
  controller: ($scope, $state, $rootScope, $stateParams, newProjectService, alertService, gradeService, newTaskService, listenerService) ->
    if $stateParams.projectId?
      $scope.studentProjectId = $stateParams.projectId
    else if $scope.project?
      $scope.studentProjectId = $scope.project.id

    $scope.grades = gradeService.grades
    $scope.gradeAcronyms = gradeService.gradeAcronyms

    $scope.currentVisualisation = 'burndown'

    $scope.chooseGrade = (idx) ->
      $scope.project.targetGrade = idx
      newProjectService.update($scope.project).subscribe(
        (response) ->
          alertService.add("success", "Target updated")
      )
      updateTaskCompletionStats()

    $scope.taskCount = ->
      $scope.unit.taskDefinitionCount

    $scope.taskStats = {}

    # Update move to task and project...
    updateTaskCompletionStats = ->
      $scope.taskStats.numberOfTasksCompleted = $scope.project.tasksByStatus(newTaskService.completeStatus).length
      $scope.taskStats.numberOfTasksRemaining = $scope.project.activeTasks().length - $scope.taskStats.numberOfTasksCompleted

    $scope.$on 'TaskStatusUpdated', ->
      updateTaskCompletionStats()


    updateTaskCompletionStats()
)
