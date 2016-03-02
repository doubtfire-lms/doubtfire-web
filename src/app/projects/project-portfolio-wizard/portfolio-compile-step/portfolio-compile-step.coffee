angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-compile-step', [])

#
# Step that confirms portfolio compilation
#
.directive('portfolioCompileStep', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/portfolio-compile-step/portfolio-compile-step.tpl.html'
  controller: ($scope, Project, alertService) ->
    $scope.toggleCompileProject = () ->
      $scope.project.compile_portfolio = not $scope.project.compile_portfolio
      Project.update { id: $scope.project.project_id, compile_portfolio: $scope.project.compile_portfolio }, (response) ->
        alertService.add("success", "Project compile schedule changed.", 2000)
)
