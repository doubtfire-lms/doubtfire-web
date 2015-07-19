angular.module('doubtfire.units.partials.unit-admin-groupset-directive', [])

#
# Task Plagiarism Report shows how the task relates tasks submitted by
# other students.
#

.directive('unitAdminGroupsetTab', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-admin-groupset-tab.tpl.html'

  controller: ($scope, TaskSimilarity) ->
    $scope.text = "Hello World"
)
