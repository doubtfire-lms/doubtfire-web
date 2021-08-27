angular.module('doubtfire.units.states.iotrack', [])
#
# State for convenors and tutors to view students in tutorial class
#
.config(($stateProvider) ->
  $stateProvider.state 'units/students/iotrack', {
    parent: 'units/index'
    url: '/iotrack/{tutorial:any}'
    templateUrl: "units/states/iotrack/iotrack.tpl.html"
    controller: "UnitIotrackStateCtrl"
    params:
      tutorial: dynamic: true
    data:
      task: "IOTrack"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)
.controller("UnitIotrackStateCtrl", ($scope, $state, $filter, $timeout, Project, UnitStudentEnrolmentModal, currentUser, unitService, alertService, taskService, gradeService, analyticsService, projectService) ->

)
