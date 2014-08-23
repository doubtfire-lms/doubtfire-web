angular.module('doubtfire.projects.partials.contexts', [])

.directive('progressInfo', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/progress-info.tpl.html'
  controller: ($scope, $state, $stateParams, Project, Unit, UnitRole, headerService, alertService, gradeService) ->
    $scope.studentProjectId = $stateParams.projectId
    $scope.grades = gradeService.grades

    $scope.chooseGrade = (idx) ->
      Project.update { id: $scope.project.project_id, target_grade: idx }, (project) ->
        $scope.project.target_grade = project.target_grade
        $scope.burndownData = project.burndown_chart_data

    $scope.xAxisTickFormat_Date_Format = () ->
      (d) -> d3.time.format('%b %d')(new Date(d * 1000))
  
    $scope.yAxisTickFormat_Percent_Format = () ->
      (d) -> d3.format(',%')(d)
  
    $scope.colorFunction = () ->
      (d, i) ->
        if i == 0 #projeted
          '#AAAAAA'
        else if i == 1 #target
          '#777777'
        else if i == 2 #done
          '#336699'
        else #sign off
          '#E01B5D'
  
    #
    # Clips x values to be at the y = 0 intercept if y < 0
    #
    $scope.xAxisClipNegBurndown = () ->
      (d) ->
        if d[1] < 0.0
          # find the x intercept at y = 0
          # know originX is the origin date of the graph (i.e. burnoff is still 100%)
          originX = $scope.burndownData[0].values[0][0]
          # work off the 100% point and this point
          [pt1x, pt1y] = [originX, 1]
          [pt2x, pt2y] = [d[0], d[1]]
          # find gradient
          m    = (pt2y - pt1y) / (pt2x - pt1x)
          # get actual y intercept
          c    = pt1y - m * pt1x
          # solve x intercept via 0 = mx+c
          -c/m
        else
          d[0]
    
    #
    # Clips y to 0 if y < 0
    #
    $scope.yAxisClipNegBurndown = () ->
      (d) ->
        if d[1] < 0.0 then 0 else d[1]
      
    $scope.updateBurndownChart = () ->
      # $scope.burndownData.length = 0
      Project.get { id: $scope.studentProjectId }, (project) ->
        # $scope.burndownData.push(project.burndown_chart_data...)
        $scope.burndownData = project.burndown_chart_data
    
    #
    # Finds max end range for chart defined as 2 weeks (12096e5 ms) after unit's end date
    #
    $scope.lateEndDate = () ->
      return new Date(+new Date($scope.unit.end_date) + 12096e5).getTime() / 1000
  
    #
    # Allow the caller to fetch a tutorial from the unit based on its id
    #
    $scope.tutorialFromId = (tuteId) ->
      _.where $scope.unit.tutorialFromId(tuteId)
  
    $scope.taskCount = () ->
      $scope.unit.task_definitions.length
)
.directive('taskList', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/task-list.tpl.html'
  controller: ($scope, $modal, User, Unit) ->
    # TODO
)
.directive('labList', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/lab-list.tpl.html'
  controller: ($scope, $modal, User, Project) ->
    # Todo, write...
    $scope.sortOrder = 'abbreviation'
    $scope.setTutorial = (id) ->
      Project.update({ id: $scope.project.project_id, tutorial_id: id }).$promise.then (
        (project) ->
          $scope.project.tute = project.tute
      )
)
.directive('taskFeedback', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/task-feedback.tpl.html'
  controller: ($scope, $modal, TaskFeedback, taskService) ->
    #
    # PDF Local Funcs
    #
    $scope.pdf = { numPages: 0 }
    $scope.pageNo = 0
    
    loadingPdf = true
    pdfLoaded = false

    loadPdf = (task) ->
      loadingPdf = true
      pdfLoaded = false
      return if task.processing_pdf
      $scope.pageNo = 0
      PDFJS.getDocument(TaskFeedback.getTaskUrl(task)).then( (pdf)->
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
        maxWidth = (document.getElementById("panel").offsetWidth || 600) - 30
        viewport = page.getViewport(1.0) # Scale of 1.0
        if viewport.width > maxWidth
          scale = maxWidth / viewport.width
          viewport = page.getViewport(scale)
        
        canvas = document.getElementById("pdf")
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
      $scope.taskStillProcessing() || $scope.corruptPdf()
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
      (not loadingPdf) and $scope.pageNo == 0 and not $scope.taskStillProcessing()
    $scope.taskStillProcessing = () ->
      $scope.activeTask.processing_pdf
    $scope.readyToShowPDF = () ->
      pdfLoaded and (not $scope.taskStillProcessing() )

    #
    # Loading the active task
    #
    $scope.setActiveTask = (task) ->
      return if task == $scope.activeTask
      $scope.activeTask = task
      loadPdf(task)
    
    $scope.activeTaskUrl = ->
      TaskFeedback.getTaskUrl($scope.activeTask)
    
    #
    # Initialiser to load pdf
    #
    $scope.activeTask = $scope.submittedTasks[0]
    if $scope.activeTask
      loadPdf($scope.activeTask)

    #
    # Functions from taskService to get data
    #
    $scope.statusData = taskService.statusData
    $scope.statusClass = taskService.statusClass

    $scope.activeStatusData = ->
      $scope.statusData($scope.activeTask)
)
