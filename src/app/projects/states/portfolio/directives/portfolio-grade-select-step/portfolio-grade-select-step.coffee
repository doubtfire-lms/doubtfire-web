angular.module('doubtfire.projects.states.portfolio.directives.portfolio-grade-select-step', [])

#
# Allows students to select the target grade they are hoping
# to achieve with their portfolio
#
.directive('portfolioGradeSelectStep', ->
  restrict: 'E'
  replace: true
  templateUrl: 'projects/states/portfolio/directives/portfolio-grade-select-step/portfolio-grade-select-step.tpl.html'
  controller: ($scope, newProjectService, gradeService) ->
    $scope.grades = gradeService.grades
    $scope.agreedToAssessmentCriteria = $scope.projectHasLearningSummaryReport()
    $scope.chooseGrade = (idx) ->
      $scope.project.submittedGrade = idx
      newProjectService.update($scope.project).subscribe((project) ->
        $scope.project.refreshBurndownChartData()
      )
)
