angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-review-step', [])

#
# Step for students to view their portfolio and optionally delete it
#
.directive('portfolioReviewStep', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/portfolio-review-step/portfolio-review-step.tpl.html'
  controller: ($scope, alertService, Project) ->

    # Watch when portfolio value is changed to reassess
    $scope.$watch 'project.portfolio_available', ->
      $scope.hasLSR = $scope.projectHasLearningSummaryReport()
      $scope.hasTasksSelected = $scope.selectedTasks().length > 0
      $scope.portfolioIsCompiling = $scope.project.compile_portfolio
      $scope.canCompilePortfolio = (not $scope.portfolioIsCompiling) and $scope.hasTasksSelected and $scope.hasLSR and not $scope.project.portfolio_available

    #
    # Compile portfolio
    #
    $scope.toggleCompileProject = () ->
      $scope.project.compile_portfolio = not $scope.project.compile_portfolio
      Project.update { id: $scope.project.project_id, compile_portfolio: $scope.project.compile_portfolio }, (response) ->
        $scope.portfolioIsCompiling = true
        $scope.canCompilePortfolio  = false

    #
    # PDF Local Funcs
    #
    $scope.deletePortfolio = () ->
      $scope.portfolioSubmission.delete {
        id: $scope.project.project_id
      }, (response) ->
        $scope.project.portfolio_available = false
        alertService.add('info', "Portfolio has been deleted!", 5000)
)
