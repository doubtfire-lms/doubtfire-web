angular.module('doubtfire.projects.partials.portfolio', [])

.directive('projectPortfolio', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/project-portfolio.tpl.html'
  controller: ($scope, taskService, PortfolioSubmission) ->
    $scope.fileUploader = PortfolioSubmission.fileUploader($scope, $scope.project)
    $scope.clearUploads = () ->
      $scope.fileUploader.clearQueue()

    $scope.currentView = -1
    #
    # Functions from taskService to get data
    #
    $scope.statusText = taskService.statusText
    $scope.statusData = taskService.statusData
    $scope.statusClass = taskService.statusClass

    $scope.hasPDF = (task) ->
      task.has_pdf
)

.directive('learningSummaryReport', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-learning-summary-report.tpl.html'
  controller: ($scope) ->
    # file uploaded from parent
    $scope.submitLearningSummaryReport = () ->
      $scope.fileUploader.uploadPortfolioPart("LearningSummaryReport", "document")
    $scope.projectHasLearningSummaryReport = () ->
      _.where($scope.project.portfolio_files, { idx: 0 }).length > 0
)

.directive('portfolioTasks', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-tasks.tpl.html'
  controller: ($scope, Task, alertService) ->

    $scope.updateTask = (task) ->
      Task.update { id: task.id, include_in_portfolio: task.include_in_portfolio },
        (success) ->
          task.include_in_portfolio = success.include_in_portfolio
          alertService.add("success", "Task status saved.", 2000)
)

.directive('portfolioOther', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-other.tpl.html'
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

.directive('portfolioCompile', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-compile.tpl.html'
  controller: ($scope, Project, alertService) ->
    $scope.toggleCompileProject = () ->
      $scope.project.compile_portfolio = not $scope.project.compile_portfolio
      Project.update { id: $scope.project.project_id, compile_portfolio: $scope.project.compile_portfolio }, (response) ->
        alertService.add("success", "Project compile schedule changed.", 2000)
)

.directive('portfolioReview', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-review.tpl.html'
  controller: ($scope) ->
)

.directive('portfolioFiles', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-files.tpl.html'
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
