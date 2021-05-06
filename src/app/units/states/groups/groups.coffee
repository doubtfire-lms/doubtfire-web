angular.module('doubtfire.units.states.groups', [])
#
# State for convenors/students assessing ]student groups
#
.config(($stateProvider) ->
  $stateProvider.state 'units/students/groups', {
    parent: 'units/index'
    url: '/students/groups'
    templateUrl: "units/states/groups/groups.tpl.html"
    controller: "UnitGroupsStateCtrl"
    data:
      task: "Student Groups"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)
.controller("UnitGroupsStateCtrl", ($scope) ->
  # No controller needed if there is no groupwork
  return unless $scope.unit.hasGroupwork()
)
