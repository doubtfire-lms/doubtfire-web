angular.module('doubtfire.projects.states.peers-anonymized', [])

#
# Anonymized peer progress state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/peers-anonymized', {
    parent: 'projects/index'
    url: '/peer-progress/anonymized'
    templateUrl: 'projects/states/peer-progress/peers-anonymized/peers-anonymized.tpl.html'
    data:
      task: "Peer Progress"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student', 'Auditor']
   }
)
