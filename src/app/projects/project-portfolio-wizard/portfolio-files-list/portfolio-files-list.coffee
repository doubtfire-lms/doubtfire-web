angular.module('doubtfire.projects.project-portfolio-wizard.portfolio-files-list', [])

.directive('portfolioFilesList', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/portfolio-files-list/portfolio-files-list.tpl.html'
  controller: ($scope) ->
    $scope.removeFile = (file) ->
      $scope.fileUploader.api.delete {
        id: $scope.project.project_id
        idx: file.idx
        kind: file.kind
        name: file.name
      }, (response) ->
        $scope.project.portfolio_files = _.without $scope.project.portfolio_files, file
)
