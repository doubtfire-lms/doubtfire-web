angular.module('doubtfire.units.states.groups', [])
#
# State for convenors/students assessing ]student groups
#
.config(($stateProvider) ->
  $stateProvider.state 'units/students/groups', {
    parent: 'units/index'
    url: '/students/groups'
    template: "<f-unit-groups [unit]='unit' [unit-role]='unitRole'></f-unit-groups>"
    data:
      task: "Student Groups"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor']
   }
)
