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
    $scope.match = 1
    #$scope.plagiarismPage = $sce.trustAsResourceUrl("#{api}/tasks/20/similarity/#{$scope.match}?auth_token=#{currentUser.authenticationToken}")
    $scope.similarityData = null

    $scope.$watch 'task', ->
      $scope.fetchSimilarity()

    $scope.$watch 'match', ->
      $scope.fetchSimilarity()

    $scope.fetchSimilarity = () ->
      if $scope.task?.similar_to_count > 0
        TaskSimilarity.get($scope.task, $scope.match, (data) ->
          $scope.similarityData = data
        )

    $scope.shouldDisableLeftNav = () ->
      $scope.match <= 1

    $scope.shouldDisableRightNav = () ->
      $scope.match >= $scope.task.similar_to_count

    $scope.classForViews = () ->
      if $scope.similarityData.other_student.name == '???'
        'col-xs-12'
      else
        'col-lg-6 col-xs-12'

    if $scope.task?.similar_to_count > 0
      $scope.taskId = $scope.task.id
      $scope.fetchSimilarity($scope.task, $scope.match - 1)
)

.directive('taskPlagiarismFileView', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-plagiarism-file-view.tpl.html'
  scope:
    match: "=match"

  controller: ($scope) ->
)