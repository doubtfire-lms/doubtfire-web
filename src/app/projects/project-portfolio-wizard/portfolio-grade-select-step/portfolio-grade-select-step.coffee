mod = angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-grade-select-step', [])

#
# Allows students to select the target grade they are hoping
# to achieve with their portfolio
#
.directive('portfolioGradeSelectStep', ->
  restrict: 'E'
  template: require('./portfolio-grade-select-step.tpl.html')
  controller: ($scope, Project, projectService, gradeService) ->
    $scope.grades = gradeService.grades
    $scope.agreedToAssessmentCriteria = $scope.projectHasLearningSummaryReport()
    $scope.chooseGrade = (idx) ->
      Project.update { id: $scope.project.project_id, target_grade: idx }, (project) ->
        $scope.project.target_grade = project.target_grade
        $scope.project.burndown_chart_data = project.burndown_chart_data
)

module.exports = mod.name
