mod = angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-welcome-step', [])

#
# Welcome introductory step
#
.directive('portfolioWelcomeStep', ->
  restrict: 'E'
  template: require('./portfolio-welcome-step.tpl.html')
)

module.exports = mod.name
