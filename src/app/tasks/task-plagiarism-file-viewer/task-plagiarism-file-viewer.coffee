angular.module('doubtfire.tasks.task-plagiarism-file-viewer', [])

#
# Views the plagiarism detected amongst two or more students
#
.directive('taskPlagiarismFileViewer', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-plagiarism-file-viewer/task-plagiarism-file-viewer.tpl.html'
  scope:
    match: "=match"

  controller: ($scope) ->
)
