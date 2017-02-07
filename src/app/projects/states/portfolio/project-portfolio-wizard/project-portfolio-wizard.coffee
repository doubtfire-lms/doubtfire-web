angular.module('doubtfire.projects.project-portfolio-wizard', [])

#
# A wizard to generate a portfolio from a project
#
.directive('projectPortfolioWizard', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/project-portfolio-wizard.tpl.html'
  controller: ($scope, ExternalName, taskService, gradeService, PortfolioSubmission, analyticsService) ->

)
