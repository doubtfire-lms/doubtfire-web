angular.module('doubtfire.units.states.portfolios', [])
#
# State for staff viewing portfolios
#
.config(($stateProvider) ->
  $stateProvider.state 'units/students/portfolios', {
    parent: 'units/index'
    url: '/students/portfolios'
    templateUrl: "units/states/portfolios/portfolios.tpl.html"
    data:
      task: "Student Portfolios"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor']
   }
)
