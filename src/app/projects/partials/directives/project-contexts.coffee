angular.module('doubtfire.projects.partials.contexts', ['doubtfire.tasks'])

.directive('progressInfo', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/progress-info.tpl.html'
  controller: ($scope, $state, $stateParams, Project, Unit, UnitRole, headerService, alertService, gradeService, taskService) ->
    $scope.studentProjectId = $stateParams.projectId
    $scope.grades = gradeService.grades

    $scope.chooseGrade = (idx) ->
      Project.update { id: $scope.project.project_id, target_grade: idx }, (project) ->
        $scope.project.target_grade = project.target_grade
        $scope.project.burndown_chart_data = project.burndown_chart_data

    $scope.xAxisTickFormat_Date_Format = () ->
      (d) -> d3.time.format('%b %d')(new Date(d * 1000))

    $scope.yAxisTickFormat_Percent_Format = () ->
      (d) -> d3.format(',%')(d)

    $scope.colorFunction = () ->
      (d, i) ->
        if i == 0 #projeted
          '#AAAAAA'
        else if i == 1 #target
          '#777777'
        else if i == 2 #done
          '#0079d8'
        else #sign off
          '#E01B5D'

    #
    # Clips x values to be at the y = 0 intercept if y < 0
    #
    $scope.xAxisClipNegBurndown = () ->
      (d) ->
        if d[1] < 0.0
          # find the x intercept at y = 0
          # know originX is the origin date of the graph (i.e. burnoff is still 100%)
          originX = $scope.project.burndown_chart_data[0].values[0][0]
          # work off the 100% point and this point
          [pt1x, pt1y] = [originX, 1]
          [pt2x, pt2y] = [d[0], d[1]]
          # find gradient
          m    = (pt2y - pt1y) / (pt2x - pt1x)
          # get actual y intercept
          c    = pt1y - m * pt1x
          # solve x intercept via 0 = mx+c
          -c/m
        else
          d[0]

    #
    # Clips y to 0 if y < 0
    #
    $scope.yAxisClipNegBurndown = () ->
      (d) ->
        if d[1] < 0.0 then 0 else d[1]

    $scope.updateBurndownChart = () ->
      Project.get { id: $scope.studentProjectId }, (project) ->
        $scope.project.burndown_chart_data = project.burndown_chart_data

    #
    # Finds max end range for chart defined as 2 weeks (12096e5 ms) after unit's end date
    #
    $scope.lateEndDate = () ->
      return new Date(+new Date($scope.unit.end_date) + 12096e5).getTime() / 1000

    $scope.taskCount = () ->
      $scope.unit.task_definitions.length
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
          $scope.project.tute = project.tute
          $scope.project.tutorial = $scope.unit.tutorialFromId( $scope.project.tute )
          projectService.updateGroups($scope.project) #can be removed from groups by changing labs
        (response) -> alertService.add("danger", response.data.error, 6000)
      )
)
.directive('viewSubmission', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/view-submission.tpl.html'
  controller: ($scope, TaskFeedback) ->
    $scope.taskUrl = ->
      TaskFeedback.getTaskUrl($scope.project.selectedTask)

    #
    # Exceptional scenarios
    #
    $scope.taskStillProcessing = () ->
      $scope.project.selectedTask.processing_pdf
    $scope.notSubmitted = () ->
      not $scope.project.selectedTask.has_pdf and (not $scope.taskStillProcessing())
)