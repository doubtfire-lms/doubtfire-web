angular.module('doubtfire.projects.partials.portfolio', [])

.directive('projectPortfolio', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/project-portfolio.tpl.html'
  controller: ($scope, taskService, PortfolioSubmission) ->
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
      alignmentStep:
        title: "Task ILO Alignments"
        icon: "fa-chain"
        seq: 3
      taskStep:
        title: "Select Tasks"
        icon: "fa-tasks"
        seq: 4
      otherFilesStep:
        title: "Upload Other Files"
        icon: "fa-plus"
        seq: 5
      compileStep:
        title: "Compile PDF"
        icon: "fa-file-pdf-o"
        seq: 6
      reviewStep:
        title: "Review Portfolio"
        icon: "fa-book"
        seq: 7
    $scope.setActivePortfolioTab = (tab) ->
      # $scope.activePortfolioTab?.active = false
      $scope.activePortfolioTab = tab
      # $scope.activePortfolioTab.active = true
    $scope.$watch 'activePortfolioTab', (newTab, oldTab) ->
      newTab.active = true
      oldTab?.active = false
    $scope.advanceActivePortfolioTab = (advanceBy) ->
      newSeq = $scope.activePortfolioTab.seq + advanceBy
      $scope.activePortfolioTab = (tab for tabKey, tab of $scope.portfolioTabsData when tab.seq is newSeq)[0]
    $scope.setActivePortfolioTab $scope.portfolioTabsData.welcomeStep

    $scope.projectHasLearningSummaryReport = () ->
      _.where($scope.project.portfolio_files, { idx: 0 }).length > 0

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

.directive('learningSummaryReport', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-learning-summary-report.tpl.html'
  controller: ($scope) ->
    # file uploaded from parent
    $scope.submitLearningSummaryReport = () ->
      $scope.fileUploader.uploadPortfolioPart("LearningSummaryReport", "document")
)

.directive('portfolioAlignments', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-alignments.tpl.html'
  controller: ($scope, taskService) ->
    # Only show tasks with PDFs or marked as complete
    taskFilterer = (task) ->
      task.has_pdf or task.status is taskService.acronymKey.COM
    $scope.filteredTasks =
      _ .chain($scope.project.tasks)
        .filter(taskFilterer)
        .map($scope.unit.taskDef)
        .value()
)

.directive('portfolioTasks', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-tasks.tpl.html'
  controller: ($scope, Task) ->
    # alignments[task_definition_id][ilo_id]
    alignments =
      _ .chain($scope.project.task_outcome_alignments)
        .filter( (d) -> d.rating > 0 )
        .groupBy('task_definition_id')
        .map (d, i) ->
          d = _ .chain(d)
                .groupBy('learning_outcome_id')
                .map( (d, i) -> [i, d[0]] )
                .object()
                .value()
          [i, d]
        .object()
        .value()


    $scope.alignmentForTaskAndIlo = (task, ilo) ->
      alignments[task.task_definition_id]?[ilo.id]

    $scope.disableInclude = (task) ->
      alignments[task.task_definition_id] is undefined

    $scope.includeTaskInPorfolio = (task) ->
      task.include_in_portfolio = !task.include_in_portfolio
      Task.update { project_id: $scope.project.project_id, task_definition_id: task.definition.id, include_in_portfolio: task.include_in_portfolio },
        (success) ->
          task.include_in_portfolio = success.include_in_portfolio

    $scope.noTasksSelected = ->
      _.filter($scope.tasks, (t) -> t.include_in_portfolio and alignments[t.task_definition_id] is not undefined).length is 0
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
  controller: ($scope, PortfolioSubmission) ->
    #
    # PDF Local Funcs
    #
    $scope.portfolioUrl = ->
      PortfolioSubmission.getPortfolioUrl($scope.project)

    $scope.deletePortfolio = () ->
      $scope.fileUploader.api.delete {
        id: $scope.project.project_id
      }, (response) ->
        $scope.activePortfolioTab = $scope.tabData.compileStep
        $scope.project.portfolio_available = false
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

.directive('portfolioGradeSelect', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/portfolio-grade.tpl.html'
  controller: ($scope, Project, gradeService) ->
    $scope.gradeAcronyms = gradeService.gradeAcronyms
    $scope.grades        = gradeService.grades

    $scope.chooseGrade = (idx) ->
      Project.update { id: $scope.project.project_id, target_grade: idx }, (project) ->
        $scope.project.target_grade = project.target_grade
        $scope.project.burndown_chart_data = project.burndown_chart_data
)
