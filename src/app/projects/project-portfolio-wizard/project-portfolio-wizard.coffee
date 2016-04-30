angular.module('doubtfire.projects.project-portfolio-wizard', [
  'doubtfire.projects.project-portfolio-wizard.portfolio-add-extra-files-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-compile-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-grade-select-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-learning-summary-report-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-review-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-tasks-step'
  'doubtfire.projects.project-portfolio-wizard.portfolio-welcome-step'
])

#
# A wizard to generate a portfolio from a project
#
.directive('projectPortfolioWizard', ->
  restrict: 'E'
  templateUrl: 'projects/project-portfolio-wizard/project-portfolio-wizard.tpl.html'
  controller: ($scope, taskService, gradeService, PortfolioSubmission, analyticsService) ->
    #
    # Active task tab group
    #
    $scope.portfolioTabsData =
      welcomeStep:
        title: "Portfolio Preparation"
        icon: "fa-magic"
        subtitle: "Welcome to the portfolio preparation wizard"
        seq: 1
      gradeStep:
        title: "Select Grade"
        icon: "fa-trophy"
        subtitle: "In preparing your portfolio, you need to undertake a self assessment. Use the unit's assessment criteria to determine the grade your portfolio should be awarded"
        seq: 2
      summaryStep:
        title: "Learning Summary Report"
        icon: "fa-graduation-cap"
        subtitle: "Upload the Learning Summary Report, the primary porfolio document which justifies your desired grade"
        seq: 3
      taskStep:
        title: "Align and Select Tasks"
        icon: "fa-tasks"
        subtitle: "Select tasks to include and showcase in your portfolio that demonstrates your understanding of each Indended Learning Outcome"
        seq: 4
      otherFilesStep:
        title: "Upload Other Files"
        icon: "fa-upload"
        subtitle: "Add extra files that justify your learning to your portfolio"
        seq: 5
      compileStep:
        title: "Compile Portfolio PDF"
        icon: "fa-file-pdf-o"
        subtitle: "Submit your portfolio for compilation"
        seq: 6
      reviewStep:
        title: "Review Portfolio"
        icon: "fa-book"
        subtitle: "Review your portfolio submission progress"
        seq: 7
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

    $scope.projectHasLearningSummaryReport = ->
      _.filter($scope.project.portfolio_files, { idx: 0 }).length > 0

    $scope.portfolioSubmission = PortfolioSubmission($scope.project)

    # Update targetGrade value on change
    $scope.$watch 'project.target_grade', (newValue) ->
      $scope.targetGrade = gradeService.grades[newValue]

    # Jump to a step
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
)
