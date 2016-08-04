mod = angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-learning-summary-report-step', [])

#
# Step to justify the portfolio with a Learning Summary Report
#
.directive('portfolioLearningSummaryReportStep', ->
  restrict: 'E'
  template: require('./portfolio-learning-summary-report-step.tpl.html')
  controller: ($scope) ->
    $scope.forceLSRSubmit = false
)

module.exports = mod.name
