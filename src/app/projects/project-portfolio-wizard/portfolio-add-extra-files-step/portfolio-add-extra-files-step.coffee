mod = angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-add-extra-files-step', [])

#
# Allow students to add additional files to the end of their portfolio
# They can choose any file they want to upload
#
.directive('portfolioAddExtraFilesStep', ->
  restrict: 'E'
  template: require('./portfolio-add-extra-files-step.tpl.html')
  controller: ($scope, PortfolioSubmission) ->
    $scope.uploadType = 'document'
    $scope.$watch 'uploadType', (newType) ->
      return unless newType?
      $scope.uploadFileData = $scope.portfolioSubmission.otherFileFileUploadData newType
)

module.exports = mod.name
