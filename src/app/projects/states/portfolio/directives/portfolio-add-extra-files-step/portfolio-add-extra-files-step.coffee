angular.module('doubtfire.projects.states.portfolio.directives.portfolio-add-extra-files-step', [])

#
# Allow students to add additional files to the end of their portfolio
# They can choose any file they want to upload
#
.directive('portfolioAddExtraFilesStep', ->
  restrict: 'E'
  replace: true
  templateUrl: 'projects/states/portfolio/directives/portfolio-add-extra-files-step/portfolio-add-extra-files-step.tpl.html'
  controller: ($scope, PortfolioSubmission) ->
    $scope.uploadType = 'document'
    $scope.$watch 'uploadType', (newType) ->
      return unless newType?
      $scope.uploadFileData = $scope.portfolioSubmission.otherFileFileUploadData newType
)
