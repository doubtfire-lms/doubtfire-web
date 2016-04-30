angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-review-step', [])

#
# Step for students to view their portfolio and optionally delete it
#
.directive('portfolioReviewStep', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/portfolio-review-step/portfolio-review-step.tpl.html'
  controller: ($scope, alertService, Project) ->
    $scope.hasLSR = $scope.projectHasLearningSummaryReport()
    $scope.hasTasksSelected = $scope.selectedTasks().length > 0
    $scope.portfolioIsCompiling = $scope.project.compile_portfolio
    $scope.canCompilePortfolio = (not $scope.portfolioIsCompiling) and $scope.hasTasksSelected and $scope.hasLSR

    #
    # Compile portfolio
    #
    $scope.toggleCompileProject = () ->
      $scope.project.compile_portfolio = not $scope.project.compile_portfolio
      Project.update { id: $scope.project.project_id, compile_portfolio: $scope.project.compile_portfolio }, (response) ->
        alertService.add("success", "Project compile schedule changed.", 2000)

    #
    # PDF Local Funcs
    #
    $scope.deletePortfolio = () ->
      $scope.fileUploader.api.delete {
        id: $scope.project.project_id
      }, (response) ->
        $scope.activePortfolioTab = $scope.tabData.compileStep
        $scope.project.portfolio_available = false
)
