angular.module('doubtfire.tasks.partials.task-plagiarism-report', [])

#
# Task Plagiarism Report shows how the task relates tasks submitted by
# other students.
#

.directive('taskPlagiarismReport', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-plagiarism-report.tpl.html'
  scope:
    task: "=task"

  controller: ($scope, TaskSimilarity) ->
    # functions from task service
    #$scope.task = task
    $scope.test = "Test"
    $scope.match = 1
    #$scope.plagiarismPage = $sce.trustAsResourceUrl("#{api}/tasks/20/similarity/#{$scope.match}?auth_token=#{currentUser.authenticationToken}")
    $scope.similarityHtml = "<pre>Fetching</pre>"

    $scope.fetchSimilarity = () ->
      TaskSimilarity.get($scope.task, $scope.match, (html) ->
        $scope.similarityHtml = html
      )

    $scope.shouldDisableLeftNav = () ->
      $scope.match <= 1

    $scope.shouldDisableRightNav = () ->
      $scope.match >= $scope.task.similar_to_count

    $scope.prevMatch = () ->
      $scope.match--
      $scope.fetchSimilarity($scope.task, $scope.match - 1)

    $scope.nextMatch = () ->
      $scope.match++
      $scope.fetchSimilarity($scope.task, $scope.match - 1)

    if $scope.task
      $scope.taskId = $scope.task.id
      $scope.fetchSimilarity($scope.task, $scope.match - 1)
)