angular.module('doubtfire.projects.partials.projectTopTasks', [])

.directive('projectTopTasks', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/project-top-tasks.tpl.html'
  scope:
    project: "=project"
    onSelect: "="
  controller: ($scope, taskService, gradeService) ->
    $scope.statusText = taskService.statusText
    $scope.statusData = taskService.statusData
    $scope.statusClass = taskService.statusClass
    $scope.statusIcon = (status) -> taskService.statusIcons[status]

    now = new Date()
    weekday = [
      "Sunday"
      "Monday"
      "Tuesday"
      "Wednesday"
      "Thursday"
      "Friday"
      "Saturday"
    ]
    today = weekday[now.getDay()]


    calculateTopTasks = (input) ->
      result = []
      #
      # sort tasks by target date
      #
      sortedTasks = _.sortBy(_.sortBy(_.filter(input, (task) -> _.contains taskService.validTopTask, task.status), 'definition.seq'), 'definition.target_date')
      
      overdueTasks = _.filter sortedTasks, (task) ->
        taskService.daysOverdue(task) > 0

      #
      # Step 1: if today is the tutorial day... show tasks to discuss with tutor
      #
      tutorialDay = $scope.project.tutorial.meeting_day

      tasksToDiscuss = _.filter overdueTasks, (task) -> _.contains taskService.statusToDiscuss, task.status
      
      if tasksToDiscuss? && tasksToDiscuss.length > 0
        # Only add if the tasks are to be discussed today...
        if today == tutorialDay
          toAdd = _.map tasksToDiscuss, (task) -> { task: task, reason: "Discuss this task with your tutor in class today."}
          Array.prototype.push.apply result, toAdd
        return _.slice(result, 0, 5) if _.size(result) >= 5
        overdueTasks = _.filter overdueTasks, (task) -> not _.contains tasksToDiscuss, task

      #
      # Step 2: select tasks not complete that are overdue
      #
      for grade in gradeService.gradeValues
        overdueGradeTasks = _.filter overdueTasks, (task) ->
          task.definition.target_grade == grade

        if overdueGradeTasks? && overdueGradeTasks.length > 0
          toAdd = _.map overdueGradeTasks, (task) -> { task: task, reason: "Complete this #{gradeService.grades[grade]} task to get back on track."}
          Array.prototype.push.apply result, toAdd
        break if result.length >= 5
      
      return _.slice(result, 0, 5) if result.length >= 5

      #
      # Step 3: ... up to date, so look forward
      #
      toAdd = _.map (_.filter sortedTasks, (task) -> _.contains(taskService.toBeWorkedOn, task.status) && taskService.daysFromTarget(task) < 0), (task) ->
        { task: task, reason: "This is one of the next tasks for you to complete." }
      Array.prototype.push.apply result, toAdd

      return _.slice(result, 0, 5)

    $scope.topTasks = []
    refreshTopTasks = () ->
      $scope.topTasks.length = 0
      $scope.topTasks = calculateTopTasks($scope.project.activeTasks())

    $scope.$watch "project.target_grade", refreshTopTasks

    refreshTopTasks()
)