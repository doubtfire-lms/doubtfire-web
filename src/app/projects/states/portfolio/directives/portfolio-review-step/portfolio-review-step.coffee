angular.module('doubtfire.projects.states.portfolio.directives.portfolio-review-step', [])

#
# Step for students to view their portfolio and optionally delete it
#
.directive('portfolioReviewStep', ->
  restrict: 'E'
  replace: true
  templateUrl: 'projects/states/portfolio/directives/portfolio-review-step/portfolio-review-step.tpl.html'
  controller: ($scope, alertService, newProjectService, DoubtfireConstants, ConfirmationModal, fileDownloaderService) ->

    # Get the confugurable, external name of Doubtfire
    $scope.externalName = DoubtfireConstants.ExternalName

    # Watch when portfolio value is changed to reassess
    $scope.$watch 'project.portfolioAvailable', ->
      $scope.hasLSR = $scope.projectHasLearningSummaryReport()
      $scope.hasTasksSelected = $scope.selectedTasks().length > 0
      $scope.portfolioIsCompiling = $scope.project.compilePortfolio
      $scope.canCompilePortfolio = (not $scope.portfolioIsCompiling) and $scope.hasTasksSelected and $scope.hasLSR and not $scope.project.portfolioAvailable

    #
    # Compile portfolio
    #
    $scope.toggleCompileProject = ->
      $scope.project.compilePortfolio = not $scope.project.compilePortfolio

      newProjectService.update($scope.project).subscribe(
        (response) ->
          $scope.portfolioIsCompiling = true
          $scope.canCompilePortfolio  = false
          $scope.project.portfolioStatus = 0.5
      )
    #
    # PDF Local Funcs
    #
    $scope.deletePortfolio = ->
      doDelete = ->
        $scope.project.deletePortfolio().subscribe(       (response) ->
          $scope.project.portfolioAvailable = false
          $scope.project.portfolioStatus = 0
          alertService.add('info', "Portfolio has been deleted!", 5000)
        )
      ConfirmationModal.show("Delete Portfolio?", 'Are you sure you want to delete your portfolio? You will need to recreate your porfolio again if you do so.', doDelete)

    # Download the pdf
    $scope.downloadPortfolio = ->
      fileDownloaderService.downloadFile($scope.project.portfolioUrl(true), "#{$scope.project.student.username}-portfolio.pdf")
)
