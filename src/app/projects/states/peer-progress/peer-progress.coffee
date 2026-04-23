angular.module('doubtfire.projects.states.peer-progress', [])

#
# Peer progress state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/peer-progress', {
    parent: 'projects/index'
    url: '/peer-progress'
    templateUrl: 'projects/states/peer-progress/peer-progress.tpl.html'
    data:
      task: "Peer Progress"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student', 'Auditor']
   }
)
