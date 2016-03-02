angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-add-extra-files-step', [])

#
# Allow students to add additional files to the end of their portfolio
# They can choose any file they want to upload
#
.directive('portfolioAddExtraFilesStep', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/portfolio-add-extra-files-step/portfolio-add-extra-files-step.tpl.html'
  controller: ($scope) ->
    $scope.uploadType = 'code'
    $scope.uploadDropdown = {
      open: false
    }

    $scope.changeTo = (type) ->
      $scope.uploadType = type
      $scope.fileUploader.clearQueue()
      $scope.uploadDropdown.open = false

    $scope.submitOther = () ->
      $scope.fileUploader.uploadPortfolioPart("Other", $scope.uploadType)
)
