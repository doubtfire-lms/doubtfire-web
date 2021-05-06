angular.module('doubtfire.projects.states.portfolio.directives.portfolio-welcome-step', [])

#
# Welcome introductory step
#
.directive('portfolioWelcomeStep', ->
  restrict: 'E'
  replace: true
  templateUrl: 'projects/states/portfolio/directives/portfolio-welcome-step/portfolio-welcome-step.tpl.html'
)
