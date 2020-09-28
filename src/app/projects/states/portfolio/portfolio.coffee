angular.module('doubtfire.projects.states.portfolio', [
  'doubtfire.projects.states.portfolio.directives'
])

#
# Tasks state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/portfolio', {
    parent: 'projects/index'
    url: '/portfolio'
    controller: 'ProjectsPortfolioStateCtrl'
    templateUrl: 'projects/states/portfolio/portfolio.tpl.html'
    data:
      task: "Portfolio Creation"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student']
   }
)

.controller("ProjectsPortfolioStateCtrl", ($scope, DoubtfireConstants, taskService, gradeService, PortfolioSubmission, analyticsService) ->
  #
  # Active task tab group
  #
  $scope.tabs =
    welcomeStep:
      title: "Portfolio Preparation"
      seq: 1
    gradeStep:
      title: "Select Grade"
      seq: 2
    summaryStep:
      title: "Learning Summary Report"
      seq: 3
    taskStep:
      title: "Select Tasks"
      seq: 4
    otherFilesStep:
      title: "Upload Other Files"
      seq: 5
    reviewStep:
      title: "Review Portfolio"
      seq: 6
  $scope.setActiveTab = (tab) ->
    $scope.activeTab = tab
    $scope.activeTab.active = true
    analyticsService.event 'Portfolio Wizard', 'Switched to Step', "#{tab.title} Step"
  $scope.advanceActiveTab = (advanceBy) ->
    newSeq = $scope.activeTab.seq + advanceBy
    $scope.setActiveTab (tab for tabKey, tab of $scope.tabs when tab.seq is newSeq)[0]

  $scope.projectHasLearningSummaryReport = ->
    _.filter($scope.project.portfolio_files, { idx: 0 }).length > 0

  # Determine whether project is using draft learning summary
  $scope.projectHasDraftLearningSummaryReport = $scope.project.uses_draft_learning_summary

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
  $scope.externalName = DoubtfireConstants.ExternalName

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
    $scope.setActiveTab $scope.tabs.reviewStep
  else if $scope.projectHasDraftLearningSummaryReport
    $scope.setActiveTab $scope.tabs.summaryStep
  else if $scope.projectHasLearningSummaryReport()
    $scope.setActiveTab $scope.tabs.taskStep
  else
    $scope.setActiveTab $scope.tabs.welcomeStep

  #
  # Functions from taskService to get data
  #
  $scope.statusText = taskService.statusText
  $scope.statusData = taskService.statusData
  $scope.statusClass = taskService.statusClass
)
