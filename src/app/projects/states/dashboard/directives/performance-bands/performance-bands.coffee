angular.module('doubtfire.projects.states.dashboard.directives.performance-bands', []).directive 'performanceBands', ->
  restrict: 'E'
  replace: true
  templateUrl: 'projects/states/dashboard/directives/performance-bands/performance-bands.tpl.html'
  scope:
    project: '='
  controller: ($scope) ->

    $scope.showResults = true

    $scope.performanceBands = [
      { label: 'High Distinction', value: 0, colorClass: 'high-distinction' }
      { label: 'Above Average', value: 0, colorClass: 'above-average' }
      { label: 'Average', value: 0, colorClass: 'average' }
      { label: 'Below Average', value: 0, colorClass: 'below-average' }
    ]

    $scope.calculateBands = ->
      return unless $scope.project?
      tasks = $scope.project.activeTasks()
      return if tasks.length == 0

      # Count how many tasks in each band
      counts = { hd: 0, oa: 0, a: 0, ba: 0 }
      totalTasksCount = tasks.length

      for task in tasks
        status = task.status
        
        # High Distinction (Completed / Verified)
        if ['complete', 'discuss', 'demonstrate'].includes(status)
          if task.hasGrade()
            if task.grade >= 2 then counts.hd += 1 else counts.oa += 1
          else if task.hasBeenGivenQualityPoints() and task.definition.maxQualityPts > 0
            if (task.qualityPts / task.definition.maxQualityPts) >= 0.8 then counts.hd += 1 else counts.oa += 1
          else
            counts.hd += 1

        # Above Average (Ready for feedback)
        else if ['ready_for_feedback'].includes(status)
          counts.oa += 1

        # Below Average (Struggling / Overdue / Needs Fix)
        else if ['fix_and_resubmit', 'time_exceeded', 'feedback_exceeded', 'fail', 'redo', 'need_help'].includes(status) or task.isOverdue()
          counts.ba += 1

        # Average (Default - Working on it, not started)
        else
          counts.a += 1

      if totalTasksCount > 0
        $scope.performanceBands[0].value = Math.round((counts.hd / totalTasksCount) * 100)
        $scope.performanceBands[1].value = Math.round((counts.oa / totalTasksCount) * 100)
        $scope.performanceBands[2].value = Math.round((counts.a / totalTasksCount) * 100)
        $scope.performanceBands[3].value = 100 - ($scope.performanceBands[0].value + $scope.performanceBands[1].value + $scope.performanceBands[2].value)
      else
        $scope.performanceBands[0].value = 0
        $scope.performanceBands[1].value = 0
        $scope.performanceBands[2].value = 0
        $scope.performanceBands[3].value = 0

    $scope.$watch 'project.tasks', ->
      $scope.calculateBands()
    , true

    $scope.$on 'TaskStatusUpdated', ->
      $scope.calculateBands()

    $scope.calculateBands()
