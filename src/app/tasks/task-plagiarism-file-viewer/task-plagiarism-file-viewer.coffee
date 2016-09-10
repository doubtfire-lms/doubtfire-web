mod = angular.module('doubtfire.tasks.task-plagiarism-file-viewer', [])

#
# Views the plagiarism detected amongst two or more students
#
.directive('taskPlagiarismFileViewer', (TaskSimilarity, alertService) ->
  replace: true
  restrict: 'E'
  template: require('./task-plagiarism-file-viewer.tpl.html')
  scope:
    task: "=task"
    match: "=match"
    matchIdx: "=matchIdx"
    other: "=other"
    assessingUnitRole: "="
  controller: ($scope) ->
    if _.isString $scope.assessingUnitRole?.role
      $scope.canDismiss = _.includes(["Tutor", "Convenor"], $scope.assessingUnitRole.role)
    else
      $scope.canDismiss = false

    $scope.dismiss_similarity = (value) ->
      TaskSimilarity.put($scope.task, $scope.matchIdx, $scope.other, value,((data) ->
        alertService.add("success", "Similarity dismiss status changed.", 4000)
        $scope.match.dismissed = value
        ), (response) ->
          message = response.data || response.statusText
          alertService.add("danger", "Failed to change status. #{message}")
        )
)

module.exports = mod.name
