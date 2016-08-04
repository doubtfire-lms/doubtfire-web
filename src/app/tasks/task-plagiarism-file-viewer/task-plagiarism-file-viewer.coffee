mod = angular.module('doubtfire.tasks.task-plagiarism-file-viewer', [])

#
# Views the plagiarism detected amongst two or more students
#
.directive('taskPlagiarismFileViewer', ->
  replace: true
  restrict: 'E'
  template: require('./task-plagiarism-file-viewer.tpl.html')
  scope:
    match: "=match"

  controller: ($scope) ->
)

module.exports = mod.name
