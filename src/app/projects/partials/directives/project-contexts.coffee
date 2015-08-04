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
  controller: ($scope, $modal, User, Project, alertService) ->
    # Todo, write...
    $scope.sortOrder = 'abbreviation'
    $scope.setTutorial = (id) ->
      Project.update(
        { id: $scope.project.project_id, tutorial_id: id }
        (project) -> $scope.project.tute = project.tute
        (response) -> alertService.add("danger", response.data.error, 6000)
      )
)
.directive('taskFeedback', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/task-feedback.tpl.html'
  scope:
    unit: '='
    project: '='
    activeTask: '='
    assessingUnitRole: '='
  controller: ($scope, $modal, $state, $stateParams, TaskFeedback, Task, Project, taskService, groupService, alertService, projectService) ->
    #
    # Active task tab group
    #
    $scope.tabsData =
      taskSheet:
        title: "View Task Sheet"
        subtitle: "The task sheet contains the requirements of this task"
        icon: "fa-info"
        seq: 0
        active: false
      fileUpload:
        title: "Upload Submission"
        subtitle: "Upload your submission so it is ready for your tutor to mark"
        icon: "fa-upload"
        seq: 1
        active: false
      viewSubmission:
        title: "View Submission"
        subtitle: "View the latest submission you have uploaded"
        icon: "fa-file-o"
        seq: 2
        active: false
      viewComments:
        title: "View Comments"
        subtitle: "Write and read comments between you and your tutor"
        icon: "fa-comments-o"
        seq: 3
        active: false
      plagiarismReport:
        title: "View Similarities Detected"
        subtitle: "See the other submissions and how closely they relate to your submission"
        icon: "fa-eye"
        seq: 4
        active: false

    #
    # Sets the active tab
    #
    $scope.setActiveTab = (tab) ->
      # Do nothing if we're switching to the same tab
      return if tab is $scope.activeTab
      if $scope.activeTab?
        $scope.activeTab.active = false
      $scope.activeTab = tab
      $scope.activeTab.active = true

    #
    # Checks if tab is the active tab
    #
    $scope.isActiveTab = (tab) ->
      tab is $scope.activeTab

    #
    # Loading the active task
    #
    $scope.setActiveTask = (task) ->
      return if task == $scope.activeTask
      $scope.activeTask = task

    #
    # Functions from taskService to get data
    #
    $scope.statusData  = taskService.statusData
    $scope.statusClass = taskService.statusClass
    $scope.daysOverdue = taskService.daysOverdue

    $scope.activeStatusData = ->
      $scope.statusData($scope.activeTask)

    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit)

    $scope.hideGroupSetName = ->
      gsNames = _.pluck $scope.unit.group_sets.id
      gsNames.length is 1 and gsNames[0] is null

    $scope.recreatePDF = ->
      taskService.recreatePDF($scope.activeTask, null)

    #
    # Statuses tutors/students may change task to
    #
    $scope.studentStatuses  = taskService.switchableStates.student
    $scope.tutorStatuses    = taskService.switchableStates.tutor
    $scope.taskEngagementConfig = {
      studentTriggers: $scope.studentStatuses.map (status) ->
        { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
      tutorTriggers: $scope.tutorStatuses.map (status) ->
        { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
      }

    $scope.activeClass = (status) ->
      if status == $scope.activeTask.status
        "active"
      else
        ""

    $scope.triggerTransition = (status) ->
      oldStatus = $scope.activeTask.status

      if (status == 'ready_to_mark' || status == 'need_help') and $scope.activeTask.definition.upload_requirements.length > 0
        $scope.setActiveTab($scope.tabsData['fileUpload'])
        return # handle with the uploader...
      else
        Task.update(
          { id: $scope.activeTask.id, trigger: status }
          # Success
          (value) ->
            $scope.activeTask.status = value.status
            projectService.updateTaskStats($scope.project, value.new_stats)

            if value.status == status
              alertService.add("success", "Status saved.", 2000)
            else
              alertService.add("info", "Status change was not changed.", 4000)
          # Fail
          (value) ->
            $scope.activeTask.status = oldStatus
            alertService.add("danger", value.data.error, 6000)
        )

    # Ensure there is an active task!
    $scope.setActiveTask($scope.activeTask)

    # select initial tab
    if $stateParams.viewing == 'feedback'
      $scope.setActiveTab($scope.tabsData['viewSubmission'])
    else if $stateParams.viewing == 'submit'
      $scope.setActiveTab($scope.tabsData['fileUpload'])
    else if $scope.activeTask?
      switch $scope.activeTask.status
        when 'not_submitted'
          $scope.setActiveTab($scope.tabsData['taskSheet'])
        when 'ready_to_mark', 'complete', 'discuss', 'fix_and_include'
          $scope.setActiveTab($scope.tabsData['viewSubmission'])
        when 'fix_and_resubmit', 'working_on_it', 'need_help', 'redo'
          $scope.setActiveTab($scope.tabsData['fileUpload'])
        else
          $scope.setActiveTab($scope.tabsData['taskSheet'])
    else
      $scope.setActiveTab($scope.tabsData['taskSheet'])
)
.directive('viewSubmission', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/view-submission.tpl.html'
  controller: ($scope, TaskFeedback) ->
    $scope.taskUrl = ->
      TaskFeedback.getTaskUrl($scope.activeTask)

    #
    # Exceptional scenarios
    #
    $scope.taskStillProcessing = () ->
      $scope.activeTask.processing_pdf
    $scope.notSubmitted = () ->
      not $scope.activeTask.has_pdf and (not $scope.taskStillProcessing())
)