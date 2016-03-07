angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-learning-summary-report-step', [])

#
# Step to justify the portfolio with a Learning Summary Report
#
.directive('portfolioLearningSummaryReportStep', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/portfolio-learning-summary-report-step/portfolio-learning-summary-report-step.tpl.html'
  controller: ($scope) ->
    # file uploaded from parent
    $scope.submitLearningSummaryReport = () ->
      $scope.fileUploader.uploadPortfolioPart("LearningSummaryReport", "document")
)
