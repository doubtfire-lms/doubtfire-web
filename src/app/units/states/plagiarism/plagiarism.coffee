angular.module('doubtfire.units.states.plagiarism', [])
#
# State for staff viewing plagiarism
#
.config(($stateProvider) ->
  $stateProvider.state 'units/students/plagiarism', {
    parent: 'units/index'
    url: '/students/plagiarism'
    templateUrl: "units/states/plagiarism/plagiarism.tpl.html"
    controller: "UnitPlagiarismStateCtrl"
    data:
      task: "Student Plagiarism"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)
.controller("UnitPlagiarismStateCtrl", ($scope) ->
  # TODO: Refactor plagiarism viewer into scope
)
