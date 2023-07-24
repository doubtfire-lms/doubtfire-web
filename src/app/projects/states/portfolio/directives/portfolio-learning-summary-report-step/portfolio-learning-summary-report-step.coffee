angular.module('doubtfire.projects.states.portfolio.directives.portfolio-learning-summary-report-step', [])

#
# Step to justify the portfolio with a Learning Summary Report
#
.directive('portfolioLearningSummaryReportStep', ->
  restrict: 'E'
  replace: true
  templateUrl: 'projects/states/portfolio/directives/portfolio-learning-summary-report-step/portfolio-learning-summary-report-step.tpl.html'
  controller: ($scope) ->
    $scope.forceLSRSubmit = false
    $scope.acceptUploadNewLearningSummary = false

    $scope.learningSummaryReportFileUploadData = {
      type: {
        file0: { name: "Learning Summary Report", type: "document" }
      },
      payload: {
        name: "LearningSummaryReport" # DO NOT MODIFY - case senstitive on API
        kind: "document"
      }
    }

    $scope.addNewFile = (newFile) ->
      $scope.addNewFilesToPortfolio(newFile)
      $scope.projectHasDraftLearningSummaryReport = false
      $scope.acceptUploadNewLearningSummary = false
      $scope.forceLSRSubmit = false
)
