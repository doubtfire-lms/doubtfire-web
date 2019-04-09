angular.module('doubtfire.tasks.task-plagiarism-report-viewer', [])

#
# Task Plagiarism Report shows how the task relates tasks submitted by
# other students.
#
.directive('taskPlagiarismReportViewer', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-plagiarism-report-viewer/task-plagiarism-report-viewer.tpl.html'
  scope:
    task: "="
    assessingUnitRole: "="

  controller: ($scope, $window, TaskSimilarity, DoubtfireConstants) ->
    # functions from task service
    $scope.match = 1
    $scope.similarityData = null

    # Get the confugurable, external name of Doubtfire
    $scope.externalName = DoubtfireConstants.ExternalName

    # Set up mail link
    if $scope.assessingUnitRole
      $scope.$watch 'similarityData', (newData) ->
        if newData?
          firstAddress = $scope.similarityData.student.email
          secondAddress = $scope.similarityData.other_student.email
          subject = encodeURIComponent("Plagiarism Report for #{$scope.task.definition.abbreviation}")
          $scope.mailtoString = "mailto:?BCC=#{firstAddress},#{secondAddress}&Subject=#{subject}"
          $scope.canViewOther = newData.other_student.name?

    $scope.$watch 'task', ->
      $scope.fetchSimilarity()

    $scope.$watch 'match', ->
      $scope.fetchSimilarity()

    $scope.noPlagiarismDetected = ->
      !$scope.task.plagiarismDetected() || $scope.similarityData == null

    $scope.fetchSimilarity = ->
      if $scope.task?.similar_to_count > 0
        TaskSimilarity.get($scope.task, $scope.match, (data) ->
          $scope.similarityData = data
        )

    if $scope.task?.similar_to_count > 0
      $scope.taskId = $scope.task.id
      $scope.fetchSimilarity($scope.task, $scope.match - 1)
)
