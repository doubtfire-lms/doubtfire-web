angular.module('doubtfire.projects.partials.contexts', ['doubtfire.tasks'])

.directive('progressInfo', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/progress-info.tpl.html'
  controller: ($scope, $state, $rootScope, $stateParams, Project, Unit, UnitRole, headerService, alertService, gradeService, taskService, projectService, analyticsService) ->
    $scope.studentProjectId = $stateParams.projectId
    $scope.grades = gradeService.grades
    $scope.gradeAcronyms = gradeService.gradeAcronyms

    $scope.currentVisualisation = 'burndown'

    $scope.taskDetailsSelector = { viewAll: false }

    $scope.chooseGrade = (idx) ->
      Project.update { id: $scope.project.project_id, target_grade: idx }, (project) ->
        $scope.project.target_grade = project.target_grade
        $scope.project.burndown_chart_data = project.burndown_chart_data
        projectService.updateTaskStats $scope.project, project.stats
        analyticsService.event "Student Feedback View - Progress Tab", "Grade Changed", idx
        $rootScope.$broadcast "TargetGradeUpdated"

    $scope.taskCount = () ->
      $scope.unit.task_definitions.length

    $scope.taskStats = {}

    updateTaskCompletionStats = () ->
      $scope.taskStats.numberOfTasksCompleted = projectService.tasksByStatus($scope.project, taskService.acronymKey.COM).length
      $scope.taskStats.numberOfTasksRemaining = projectService.tasksInTargetGrade($scope.project).length - $scope.taskStats.numberOfTasksCompleted

    $scope.$on 'TaskStatusUpdated', () ->
      updateTaskCompletionStats()

    $scope.$on 'TargetGradeUpdated', () ->
      updateTaskCompletionStats()

    updateTaskCompletionStats()
)
.directive('taskList', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/task-list.tpl.html'
  controller: ($scope, $modal, User, Unit) ->
    # TODO
)
.directive('labList', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/lab-list.tpl.html'
  controller: ($scope, $modal, User, Project, alertService, projectService) ->
    # Todo, write...
    $scope.sortOrder = 'abbreviation'
    $scope.setTutorial = (id) ->
      Project.update(
        { id: $scope.project.project_id, tutorial_id: id }
        (project) ->
          $scope.project.tutorial_id = project.tutorial_id
          $scope.project.tutorial = $scope.unit.tutorialFromId( $scope.project.tutorial_id )
          projectService.updateGroups($scope.project) #can be removed from groups by changing labs
        (response) -> alertService.add("danger", response.data.error, 6000)
      )
)
.directive('viewSubmission', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/view-submission.tpl.html'
  scope:
    project: "=project"
    task: "=task"
  controller: ($scope, TaskFeedback) ->
    $scope.taskUrl = ->
      TaskFeedback.getTaskUrl($scope.task)

    #
    # Exceptional scenarios
    #
    $scope.taskStillProcessing = () ->
      $scope.task.processing_pdf
    $scope.notSubmitted = () ->
      not $scope.task.has_pdf and (not $scope.taskStillProcessing())
)
