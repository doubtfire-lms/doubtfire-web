angular.module('doubtfire.units.states.students', [])
#
# State for convenors and tutors to view students
#
.config(($stateProvider) ->
  $stateProvider.state 'units/students/list', {
    parent: 'units/index'
    url: '/students'
    templateUrl: "units/states/students-list/students-list.tpl.html"
    data:
      task: "Student List"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor']
   }
)
