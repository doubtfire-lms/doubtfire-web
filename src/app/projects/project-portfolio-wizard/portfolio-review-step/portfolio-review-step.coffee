angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-review-step', [])

#
# Step for students to view their portfolio and optionally delete it
#
.directive('portfolioReviewStep', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/portfolio-review-step/portfolio-review-step.tpl.html'
  controller: ($scope, PortfolioSubmission) ->
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
