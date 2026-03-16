angular.module('doubtfire.projects.states.groups', [])

#
# Tasks state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/groups', {
    parent: 'projects/index'
    url: '/groups'
    controller: 'ProjectsGroupsStateCtrl'
    templateUrl: 'projects/states/groups/groups.tpl.html'
    data:
      task: "Groups List"
      pageTitle: "_Home_"
   }
)

.controller("ProjectsGroupsStateCtrl", ($scope) ->
  # TODO: (@alexcu) move directive inot state
)
