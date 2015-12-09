angular.module('doubtfire.tasks.partials.view-alignment-directive', [])

.directive('viewAlignment', ->
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/view-alignment.tpl.html'
  controller: ($scope, $modal, $state, $stateParams, TaskFeedback, Task, Project, taskService, groupService, alertService, projectService) ->
    #
    # Active task tab group
    #
)