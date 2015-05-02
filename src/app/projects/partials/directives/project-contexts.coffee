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
  controller: ($scope, $modal, $state, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService) ->
    #
    # Comment code
    #
    $scope.comment = { text: "" }
    $scope.currentPage = 1
    $scope.pageSize = 3
    $scope.maxSize = 5

    $scope.showAssessTaskModal = (activeTask) ->
      $modal.open
        controller: 'AssessTaskModalCtrl'
        templateUrl: 'tasks/partials/templates/assess-task-modal.tpl.html'
        resolve: {
          task: -> activeTask,
          student: -> null,
          project: -> $scope.project,
          assessingUnitRole: -> $scope.assessingUnitRole,
          onChange: -> null
        }

    fetchTaskComments = (task) ->
      TaskComment.query {task_id: task.id},
        (response) ->
          task.comments = response

    #
    # Batch Discuss button
    #
    $scope.transitionWeekEnd = () ->
      Project.update({ id: $scope.project.project_id, trigger: "trigger_week_end" }).$promise.then (
        (project) ->
          oldId = $scope.activeTask.id

          # go through each task and update the status only to the new project task's status
          _.each $scope.submittedTasks, (task) ->
            task.status = (_.find project.tasks, (t) -> task.id == t.id).status

          $scope.activeTask = _.find $scope.submittedTasks, (task) -> task.id == oldId
          alertService.add("success", "Status updated.", 2000)
      )

    #
    # Comment text area enter to submit comment
    #
    $scope.checkCommentTextareaEnter = (e) ->
      e = e || window.event
      # Hit return and not shift key
      if e.keyCode is 13 and not e.shiftKey
        $scope.addComment()
        return false
      return true

    $scope.addComment = () ->
      TaskComment.create { task_id: $scope.activeTask.id, comment: $scope.comment.text },
        (response) ->
          if ! $scope.activeTask.comments
            $scope.activeTask.comments = []
          $scope.activeTask.comments.unshift response
          $scope.comment.text = ""
        (error) ->
          alertService.add("danger", "Request failed, cannot add a comment at this time.", 2000)

    $scope.deleteComment = (id) ->
      TaskComment.delete { task_id: $scope.activeTask.id, id: id },
        (response) ->
          #$scope.activeTask.comments.splice response
          $scope.activeTask.comments = $scope.activeTask.comments.filter (e) -> e.id != id
        (error) ->
          alertService.add("danger", "Request failed, you cannot delete this comment.", 2000)

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
      return if task.processing_pdf || not task.has_pdf
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
      $scope.pageNo <= 1
    $scope.shouldDisableRightNav = () ->
      $scope.pageNo >= $scope.pdf.numPages
    $scope.shouldHideNav = () ->
      $scope.taskStillProcessing() || $scope.corruptPdf()
    # Keyboard nav
    document.onkeydown = (e) ->
      e = e || window.event
      return if document.activeElement.type is 'textarea' or document.activeElement.type is 'input'
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
      pdfLoaded and (not $scope.taskStillProcessing())
    $scope.notSubmitted = () ->
      not $scope.activeTask.has_pdf and (not $scope.taskStillProcessing())

    #
    # Loading the active task
    #
    $scope.setActiveTask = (task) ->
      return if task == $scope.activeTask
      $scope.activeTask = task
      fetchTaskComments(task)
      loadPdf(task)

    $scope.activeTaskUrl = ->
      TaskFeedback.getTaskUrl($scope.activeTask)

    #
    # Initialiser to load pdf
    #
    if $scope.showTaskId
      id = parseInt($scope.showTaskId, 10)
      $scope.activeTask = _.find $scope.submittedTasks, (task) -> task.id == id
      if not $scope.activeTask
        $scope.activeTask = $scope.submittedTasks[0]
    else
      $scope.activeTask = $scope.submittedTasks[0]
    if $scope.activeTask
      fetchTaskComments($scope.activeTask)
      loadPdf($scope.activeTask)

    #
    # Functions from taskService to get data
    #
    $scope.statusData = taskService.statusData
    $scope.statusClass = taskService.statusClass
    $scope.daysOverdue = taskService.daysOverdue

    $scope.activeStatusData = ->
      $scope.statusData($scope.activeTask)

    $scope.recreatePDF = ->
      taskService.recreatePDF($scope.activeTask, null)

    #
    # Statuses tutors may change task to
    #
    $scope.studentStatuses       = ['not_submitted', 'need_help', 'working_on_it' ] ##'ready_to_mark'##]
    $scope.tutorStatuses         = ['discuss', 'complete', 'fix_and_resubmit', 'fix_and_include', 'redo']
    $scope.taskEngagementConfig = {
      studentTriggers: $scope.studentStatuses.map (status) ->
        { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
      tutorTriggers: $scope.tutorStatuses.map (status) ->
        { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
      }

    #
    # Allow user to upload new portfolio evidence
    #
    $scope.uploadFiles = () ->
      oldStatus = $scope.activeTask.status
      $modal.open(
        controller: 'SubmitTaskModalCtrl'
        templateUrl: 'tasks/partials/templates/submit-task-modal.tpl.html'
        resolve: {
          task: -> $scope.activeTask,
          student: -> null,
          onChange: -> null
        }
      ).result.then(
        (val) -> ,
        # They cancelled the upload...
        () ->
          $scope.activeTask.status = oldStatus
          alertService.add("info", "Upload cancelled: status was reverted.", 2000)
      )


    #
    # Change state of task
    #
    $scope.triggerTransition = (status) ->
      oldStatus = $scope.activeTask.status
      if status == 'ready_to_mark' and $scope.activeTask.task_upload_requirements.length > 0
        $scope.uploadFiles()
      else
        Task.update({ id: $scope.activeTask.id, trigger: status }).$promise.then (
          # Success
          (value) ->
            $scope.activeTask.status = value.status

            if student? && student.task_stats?
              projectService.updateTaskStats(student, value.new_stats)

            if value.status == status
              alertService.add("success", "Status saved.", 2000)
            else
              alertService.add("info", "Status change was not changed.", 4000)
          ),
          # Fail
          (value) ->
            $scope.activeTask.status = oldStatus
            alertService.add("danger", value.data.error, 6000)

    $scope.activeClass = (status) ->
      if status == $scope.activeTask.status
        "active"
      else
        ""
)
