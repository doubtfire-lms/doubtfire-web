mod = angular.module('doubtfire.projects.project-progress-dashboard',[])

#
# Progress tab for the student's project
#
# Basically a dashboard where students can see everything about their
# project in one area including burndown chart, tasks to work on
# and their target grade
#
.directive('projectProgressDashboard', ->
  restrict: 'E'
  template: require('./project-progress-dashboard.tpl.html')
  controller: ($scope, $state, $rootScope, $stateParams, Project, Unit, UnitRole, headerService, alertService, gradeService, taskService, projectService, analyticsService) ->
    if $stateParams.projectId?
      $scope.studentProjectId = $stateParams.projectId
    else if $scope.project?
      $scope.studentProjectId = $scope.project.project_id

    $scope.grades = gradeService.grades
    $scope.gradeAcronyms = gradeService.gradeAcronyms

    $scope.currentVisualisation = 'burndown'

    $scope.taskDetailsSelector = { viewAll: false }

    $scope.chooseGrade = (idx) ->
      Project.update { id: $scope.project.project_id, target_grade: idx }, (project) ->
        $scope.project.target_grade = project.target_grade
        $scope.project.burndown_chart_data = project.burndown_chart_data
        projectService.updateTaskStats $scope.project, project.stats
        analyticsService.event "Student Project View - Progress Tab", "Grade Changed", $scope.grades[idx]
        $rootScope.$broadcast "TargetGradeUpdated"

    $scope.taskCount = () ->
      $scope.unit.task_definitions.length

    $scope.taskStats = {}

    updateTaskCompletionStats = () ->
      $scope.taskStats.numberOfTasksCompleted = projectService.tasksByStatus($scope.project, taskService.acronymKey.COM).length
      $scope.taskStats.numberOfTasksRemaining = projectService.tasksInTargetGrade($scope.project).length - $scope.taskStats.numberOfTasksCompleted

    $scope.$watch "taskDetailsSelector.viewAll", () ->
      if ! $scope.taskDetailsSelector.viewAll
        analyticsService.event 'Student Project View', "Showed Top Tasks"

    $scope.$on 'TaskStatusUpdated', () ->
      updateTaskCompletionStats()

    $scope.$on 'TargetGradeUpdated', () ->
      updateTaskCompletionStats()

    updateTaskCompletionStats()
)

module.exports = mod.name
