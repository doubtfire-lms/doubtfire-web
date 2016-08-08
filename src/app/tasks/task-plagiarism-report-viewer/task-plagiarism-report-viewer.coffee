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

  controller: ($scope, $window, TaskSimilarity) ->
    # functions from task service
    #$scope.task = task
    $scope.match = 1
    #$scope.plagiarismPage = $sce.trustAsResourceUrl("#{api}/tasks/20/similarity/#{$scope.match}?auth_token=#{currentUser.authenticationToken}")
    $scope.similarityData = null

    if _.isString $scope.assessingUnitRole?.role
      $scope.canSendEmail = _.includes(["Tutor", "Convenor"], $scope.assessingUnitRole.role)

    $scope.$watch 'task', ->
      $scope.fetchSimilarity()

    $scope.$watch 'match', ->
      $scope.fetchSimilarity()

    $scope.noPlagiarismDetected = ->
      $scope.tasks?.similar_to_count <= 0 || $scope.similarityData == null

    $scope.emailStudentsPlagiarism = () ->

      if $scope.similarityData?
        $scope.firstAddress = $scope.similarityData.student.username + "@student.swin.edu.au"
        $scope.secondAddress = $scope.similarityData.other_student.username + "@student.swin.edu.au"
        $scope.message = ""
        $scope.subject = "Plagiarism%20Report%20for%20" + $scope.task.definition.abbreviation

        $scope.mailtoString = "mailto:?BCC=" + $scope.firstAddress + "," + $scope.secondAddress + "&Subject=" + $scope.subject + "&body="+$scope.message

        # This stops a new tab from being opened when executing the Mailto.
        $window.location.href = $scope.mailtoString

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
        'col-md-6 col-xs-12'

    if $scope.task?.similar_to_count > 0
      $scope.taskId = $scope.task.id
      $scope.fetchSimilarity($scope.task, $scope.match - 1)
)
