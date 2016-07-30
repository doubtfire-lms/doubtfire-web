angular.module('doubtfire.tasks.task-viewer', [])

#
# Views all infomation related to a specific task including:
#  - task definition and related task sheet
#  - task submission wizard
#  - task commenter
#  - task plagiarism report
#
.directive('taskViewer', ->
  restrict: 'E'
  replace: true
  templateUrl: 'tasks/task-viewer/task-viewer.tpl.html'
  scope:
    unit: '='
    project: '='
    assessingUnitRole: '='
  controller: ($scope, $modal, $state, $timeout, $stateParams, TaskFeedback, Task, Project, taskService, groupService, alertService, projectService, analyticsService) ->
    #
    # Active task tab group
    #
    $scope.tabs =
      taskSheet:
        title: "Task Description"
        subtitle: "A brief description of this task"
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
      $scope.activeTab?.active = false
      $scope.activeTab = tab
      $scope.activeTab.active = true
      asUser = if $scope.assessingUnitRole? then $scope.assessingUnitRole.role else 'Student'
      analyticsService.event 'Student Project View - Tasks Tab', "Switched Tab as #{asUser}", "#{tab.title} Tab"

    #
    # Checks if tab is the active tab
    #
    $scope.isActiveTab = (tab) ->
      tab is $scope.activeTab

    #
    # Determines which tab to select initially for the provided task
    #
    setInitialActiveTab = (task) ->
      $scope.setActiveTab($scope.tabs.taskSheet)

    #
    # All changes that occur when the selected task changes
    #
    $scope.$watch 'project.selectedTask', (newTask) ->
      newTask = _.first $scope.project.tasks unless newTask?
      setInitialActiveTab(newTask)
      $scope.daysOverdue = taskService.daysOverdue(newTask)

    #
    # Watch for changes when the active task status changes
    #
    $scope.$watch 'project.selectedTask.status', (newStatus) ->
      $scope.activeStatusData = $scope.statusData(newStatus)

    #
    # Loading the active task
    #
    $scope.setSelectedTask = (task) ->
      analyticsService.event 'Student Project View', "Switched to Task", 'Task Feedback Page Dropdown'
      return if task is $scope.project.selectedTask
      $scope.project.selectedTask = task

    #
    # Functions from taskService to get data
    #
    $scope.statusData  = taskService.statusData
    $scope.statusClass = taskService.statusClass
    $scope.daysOverdue = taskService.daysOverdue

    #
    # Gets the group set name from the group set id provided
    #
    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit)

    # Determines if the group set name should be hidden (if there are none)
    $scope.hideGroupSetName = $scope.unit.group_sets.length is 0

    #
    # Recreates the PDF for the currently selected task
    #
    $scope.recreatePDF = ->
      taskService.recreatePDF($scope.project.selectedTask, null)

    #
    # Statuses tutors/students may change task to
    #
    $scope.studentStatuses  = taskService.switchableStates.student
    $scope.tutorStatuses    = taskService.switchableStates.tutor
    $scope.taskEngagementConfig =
      studentTriggers: $scope.studentStatuses.map taskService.statusData
      tutorTriggers:   $scope.tutorStatuses.map taskService.statusData

    #
    # Triggers the end of week transition  for the task
    #
    $scope.triggerTransition = (status) ->
      if (status is 'ready_to_mark' or status is 'need_help') and $scope.project.selectedTask.definition.upload_requirements.length > 0
        $scope.setActiveTab($scope.tabs.fileUpload)
        $scope.project.selectedTask.status = status
        return # handle with the uploader...
      else
        taskService.updateTaskStatus($scope.unit, $scope.project, $scope.project.selectedTask, status)
        asUser = if $scope.assessingUnitRole? then $scope.assessingUnitRole.role else 'Student'
        analyticsService.event 'Student Project View - Tasks Tab', "Updated Status as #{asUser}", taskService.statusLabels[status]
)
