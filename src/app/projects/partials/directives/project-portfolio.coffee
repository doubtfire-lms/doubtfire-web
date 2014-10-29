angular.module('doubtfire.projects.partials.portfolio', [])

.directive('projectPortfolio', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/project-portfolio.tpl.html'
  controller: ($scope, taskService, PortfolioSubmission) ->
    $scope.projectHasLearningSummaryReport = () ->
      _.where($scope.project.portfolio_files, { idx: 0 }).length > 0

    $scope.fileUploader = PortfolioSubmission.fileUploader($scope, $scope.project)
    $scope.clearUploads = () ->
      $scope.fileUploader.clearQueue()

    if $scope.project.portfolio_available
      $scope.currentView = 4
    else if $scope.project.compile_portfolio
      $scope.currentView = 3
    else if $scope.projectHasLearningSummaryReport()
      $scope.currentView = 1
    else
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
  controller: ($scope, PortfolioSubmission) ->
    #
    # PDF Local Funcs
    #
    $scope.pdf = { numPages: 0 }
    $scope.pageNo = 0
    
    loadingPdf = true
    pdfLoaded = false

    loadPdf = () ->
      loadingPdf = true
      pdfLoaded = false
      return if not $scope.project.portfolio_available
      $scope.pageNo = 0
      PDFJS.getDocument(PortfolioSubmission.getPortfolioUrl($scope.project)).then( (pdf)->
        $scope.pdf = pdf
        $scope.pageNo = 1
        pdfLoaded = true
        loadingPdf = false
        renderPdf()
      )
    # resize window? Re-render pdf...
    window.onresize = () ->
      if $scope.pdf && pdfLoaded
        renderPdf()
        
    renderPdf = () ->
      # Cancel if no pages to render...
      if $scope.pdf.numPages == 0
        pdfLoaded = false
        loadingPdf = false
        $scope.pageNo = 0
        return
      $scope.pdf.getPage($scope.pageNo).then( (page)->
        # We need to ensure the PDF fits inside the designated width of the panel
        # (offsetWidth of panel is initially 0 onpageload... default to 600)
        maxWidth = (document.getElementById("panel").offsetWidth || 600) - 60
        viewport = page.getViewport(1.0) # Scale of 1.0
        if viewport.width > maxWidth
          scale = maxWidth / viewport.width
          viewport = page.getViewport(scale)
        
        canvas = document.getElementById("portfolio-pdf")
        if not canvas
          return
        context = canvas.getContext("2d")
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        renderContext = { canvasContext: context, viewport: viewport }
        page.render(renderContext).then ( ()->
          pdfLoaded = true
          $scope.$apply() #need to reapply scope so that pdf canvas is updated to show
        )
      )
    #
    # PDF Interaction Funcs
    #
    $scope.nextPage = () ->
      return if $scope.shouldDisableRightNav()
      if $scope.pageNo < $scope.pdf.numPages and pdfLoaded
        $scope.pageNo++
        renderPdf()
    $scope.prevPage = () ->
      return if $scope.shouldDisableLeftNav()
      if $scope.pageNo > 0 and pdfLoaded
        $scope.pageNo--
        renderPdf()
        
    #
    # Navigation
    #
    $scope.shouldDisableLeftNav = () ->
      $scope.pageNo == 1
    $scope.shouldDisableRightNav = () ->
      $scope.pageNo == $scope.pdf.numPages
    $scope.shouldHideNav = () ->
      $scope.noPortfolioAvailable() || $scope.corruptPdf()
    # Keyboard nav
    document.onkeydown = (e) ->
      e = e || window.event
      switch (e.which || e.keyCode)
        # Left arrow
        when 37
          e.preventDefault()
          $scope.prevPage()
        # Right arrow
        when 39
          e.preventDefault()
          $scope.nextPage()
    #
    # Exceptional scenarios
    #
    $scope.corruptPdf = () ->
      (not loadingPdf) and $scope.pageNo == 0 and $scope.portfolioAvailable()
    $scope.portfolioAvailable = () ->
      $scope.project.portfolio_available
    $scope.noPortfolioAvailable = () ->
      not $scope.project.portfolio_available
    $scope.readyToShowPDF = () ->
      pdfLoaded and $scope.portfolioAvailable

    $scope.portfolioUrl = ->
      PortfolioSubmission.getPortfolioUrl($scope.project)
    
    $scope.deletePortfolio = () ->
      $scope.fileUploader.api.delete {
        id: $scope.project.project_id
      }, (response) ->
        $scope.currentView = 3
        $scope.project.portfolio_available = false
        loadPdf()

    #
    # Initialiser to load pdf
    #
    loadPdf()
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
