angular.module('doubtfire.projects.project-portfolio-wizard', [
  'doubtfire.projects.project-portfolio-wizard.portfolio-add-extra-files-step'
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
  controller: ($scope, configurationService, taskService, gradeService, PortfolioSubmission, analyticsService) ->
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
        subtitle: "Select tasks to include and showcase in your portfolio that demonstrates your understanding of each Learning Outcome"
        seq: 4
      otherFilesStep:
        title: "Upload Other Files"
        icon: "fa-upload"
        subtitle: "Add extra files that justify your learning to your portfolio"
        seq: 5
      reviewStep:
        title: "Review Portfolio"
        icon: "fa-book"
        subtitle: "Compile and review your portfolio submission"
        seq: 6
    $scope.setActivePortfolioTab = (tab) ->
      $scope.activePortfolioTab = tab
      analyticsService.event 'Portfolio Wizard', 'Switched to Step', "#{tab.title} Step"
    $scope.$watch 'activePortfolioTab', (newTab, oldTab) ->
      newTab?.active = true
      oldTab?.active = false
    $scope.advanceActivePortfolioTab = (advanceBy) ->
      newSeq = $scope.activePortfolioTab.seq + advanceBy
      $scope.activePortfolioTab = (tab for tabKey, tab of $scope.portfolioTabsData when tab.seq is newSeq)[0]
      if $scope.activePortfolioTab is $scope.portfolioTabsData.summaryStep and advanceBy > 0 and $scope.projectHasLearningSummaryReport()
        $scope.advanceActivePortfolioTab 1

    $scope.projectHasLearningSummaryReport = ->
      _.filter($scope.project.portfolio_files, { idx: 0 }).length > 0

    # Portfolio submission object
    $scope.portfolioSubmission = PortfolioSubmission($scope.project)

    # Called whenever a new file is added to the portfolio
    $scope.addNewFilesToPortfolio = (newFile) ->
      $scope.project.portfolio_files.push newFile

    # Delete file from the portfolio
    $scope.deleteFileFromPortfolio = (file) ->
      $scope.portfolioSubmission.deleteFile($scope.project, file)

    # Update targetGrade value on change
    $scope.$watch 'project.target_grade', (newValue) ->
      $scope.targetGrade = gradeService.grades[newValue]

    # Get the confugurable, external name of Doubtfire
    $scope.externalName = configurationService.getExternalName()

    # Get only extra files submitted
    $scope.extraFiles = ->
      _.filter $scope.project.portfolio_files, (f) ->
        # when f.idx is 0 it's the LSR
        f.idx isnt 0

    # Gets whether the unit has ilos
    $scope.unitHasILOs = $scope.unit.ilos.length > 0

    # Gets selected tasks in the task selector
    $scope.selectedTasks = ->
      if $scope.unitHasILOs
        # Filter by aligned tasks that are included
        tasks = _.filter $scope.project.tasks, (t) ->
          hasAlignmentsForTask = _.find($scope.project.task_outcome_alignments, { task_id: t.id })?
          t.include_in_portfolio and hasAlignmentsForTask
      else
        # Filter by included in portfolio
        tasks = _.filter $scope.project.tasks, (t) -> t.include_in_portfolio
      tasks = _.filter tasks, (t) -> !_.includes(taskService.toBeWorkedOn, t.status)
      _.sortBy tasks, (t) -> t.definition.seq

    # Jump to a step
    if $scope.project.portfolio_available or $scope.project.compile_portfolio
      $scope.setActivePortfolioTab $scope.portfolioTabsData.reviewStep
    else if $scope.projectHasLearningSummaryReport()
      $scope.setActivePortfolioTab $scope.portfolioTabsData.taskStep
    else
      $scope.setActivePortfolioTab $scope.portfolioTabsData.welcomeStep

    #
    # Functions from taskService to get data
    #
    $scope.statusText = taskService.statusText
    $scope.statusData = taskService.statusData
    $scope.statusClass = taskService.statusClass
)
