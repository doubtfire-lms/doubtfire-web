angular.module('doubtfire.projects.project-portfolio-wizard', [
  'doubtfire.projects.project-portfolio-wizard.portfolio-add-extra-files-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-compile-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-grade-select-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-learning-summary-report-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-review-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-tasks-step'
])

#
# A wizard to generate a portfolio from a project
#
.directive('projectPortfolioWizard', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/project-portfolio-wizard.tpl.html'
  controller: ($scope, taskService, PortfolioSubmission, analyticsService) ->
    #
    # Active task tab group
    #
    $scope.portfolioTabsData =
      welcomeStep:
        title: "Welcome"
        icon: "fa-smile-o"
        seq: 0
      gradeStep:
        title: "Select Grade"
        icon: "fa-trophy"
        seq: 1
      summaryStep:
        title: "Learning Summary Report"
        icon: "fa-graduation-cap"
        seq: 2
      taskStep:
        title: "Align and Select Tasks"
        icon: "fa-tasks"
        seq: 3
      otherFilesStep:
        title: "Upload Other Files"
        icon: "fa-plus"
        seq: 4
      compileStep:
        title: "Compile PDF"
        icon: "fa-file-pdf-o"
        seq: 5
      reviewStep:
        title: "Review Portfolio"
        icon: "fa-book"
        seq: 6
    $scope.setActivePortfolioTab = (tab) ->
      $scope.activePortfolioTab = tab
      analyticsService.event 'Portfolio Wizard', 'Switched to Step', "#{tab.title} Step"
    $scope.$watch 'activePortfolioTab', (newTab, oldTab) ->
      newTab.active = true
      oldTab?.active = false
    $scope.advanceActivePortfolioTab = (advanceBy) ->
      newSeq = $scope.activePortfolioTab.seq + advanceBy
      $scope.activePortfolioTab = (tab for tabKey, tab of $scope.portfolioTabsData when tab.seq is newSeq)[0]
    $scope.setActivePortfolioTab $scope.portfolioTabsData.welcomeStep

    $scope.projectHasLearningSummaryReport = () ->
      _.filter($scope.project.portfolio_files, { idx: 0 }).length > 0

    $scope.fileUploader = PortfolioSubmission.fileUploader($scope, $scope.project)
    $scope.clearUploads = () ->
      $scope.fileUploader.clearQueue()

    if $scope.project.portfolio_available
      $scope.activePortfolioTab = $scope.portfolioTabsData.reviewStep
    else if $scope.project.compile_portfolio
      $scope.activePortfolioTab = $scope.portfolioTabsData.compileStep
    else if $scope.projectHasLearningSummaryReport()
      $scope.activePortfolioTab = $scope.portfolioTabsData.taskStep
    else
      $scope.activePortfolioTab = $scope.portfolioTabsData.welcomeStep
    #
    # Functions from taskService to get data
    #
    $scope.statusText = taskService.statusText
    $scope.statusData = taskService.statusData
    $scope.statusClass = taskService.statusClass

    $scope.hasPDF = (task) ->
      task.has_pdf
)
