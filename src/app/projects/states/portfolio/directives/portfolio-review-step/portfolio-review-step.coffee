angular.module('doubtfire.projects.states.portfolio.directives.portfolio-review-step', [])

#
# Step for students to view their portfolio and optionally delete it
#
.directive('portfolioReviewStep', ->
  restrict: 'E'
  replace: true
  templateUrl: 'projects/states/portfolio/directives/portfolio-review-step/portfolio-review-step.tpl.html'
  controller: ($scope, alertService, Project, DoubtfireConstants, ConfirmationModal) ->

    # Get the confugurable, external name of Doubtfire
    $scope.externalName = DoubtfireConstants.ExternalName

    # Watch when portfolio value is changed to reassess
    $scope.$watch 'project.portfolio_available', ->
      $scope.hasLSR = $scope.projectHasLearningSummaryReport()
      $scope.hasTasksSelected = $scope.selectedTasks().length > 0
      $scope.portfolioIsCompiling = $scope.project.compile_portfolio
      $scope.canCompilePortfolio = (not $scope.portfolioIsCompiling) and $scope.hasTasksSelected and $scope.hasLSR and not $scope.project.portfolio_available

    #
    # Compile portfolio
    #
    $scope.toggleCompileProject = ->
      $scope.project.compile_portfolio = not $scope.project.compile_portfolio
      Project.update { id: $scope.project.project_id, compile_portfolio: $scope.project.compile_portfolio }, (response) ->
        $scope.portfolioIsCompiling = true
        $scope.canCompilePortfolio  = false
        $scope.project.portfolio_status = 0.5

    #
    # PDF Local Funcs
    #
    $scope.deletePortfolio = ->
      doDelete = ->
        $scope.portfolioSubmission.delete {
          id: $scope.project.project_id
        }, (response) ->
          $scope.project.portfolio_available = false
          $scope.project.portfolio_status = 0
          alertService.add('info', "Portfolio has been deleted!", 5000)
      ConfirmationModal.show("Delete Portfolio?", 'Are you sure you want to delete your portfolio? You will need to recreate your porfolio again if you do so.', doDelete)
)
