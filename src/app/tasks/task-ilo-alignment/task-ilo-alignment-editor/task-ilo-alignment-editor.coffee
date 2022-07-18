angular.module('doubtfire.tasks.task-ilo-alignment.task-ilo-alignment-editor',[])

.directive('taskIloAlignmentEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-ilo-alignment/task-ilo-alignment-editor/task-ilo-alignment-editor.tpl.html'
  scope:
    unit: "="
    project: "=?"
    showCsv: "="
    hidePanel: '=?'
    # select tasks to include in portfolio
    showIncludeTasks: '=?'
  controller: ($scope, $modal, $rootScope, $filter, alertService, gradeService, Visualisation, fileDownloaderService, CsvResultModal, outcomeService, TaskILOAlignmentModal, newTaskService, newTaskOutcomeAlignmentService) ->
    $scope.showTaskName = $scope.unit.ilos.length < 5
    $scope.showGraph = false
    $scope.closeGraph = ->
      $scope.showGraph = false
    # Set source
    if $scope.project?
      $scope.source = $scope.project
      $scope.tasks = $scope.project.tasks
      $scope.taskStatusFactor = $scope.project.taskStatusFactor.bind($scope.project)
    else
      $scope.source = $scope.unit
      #TODO unsubscribe on destroy
      $scope.unit.taskDefinitionCache.values.subscribe(
        (taskDefs) ->
          $scope.tasks = _.map taskDefs, (td) ->
            { definition: td }
      )

      $scope.taskStatusFactor = $scope.unit.taskStatusFactor

    alignments = []
    $scope.$watch 'source.taskOutcomeAlignments.length', ->
      return unless $scope.source.taskOutcomeAlignments?
      alignments =
        _ .chain($scope.source.taskOutcomeAlignments)
          .filter( (d) -> d.rating > 0 )
          .groupBy('taskDefinition.id')
          .map (d, i) ->
            d = _ .chain(d)
                  .groupBy('learningOutcome.id')
                  .map( (d, i) -> [i, d[0]] )
                  .fromPairs()
                  .value()
            [i, d]
          .fromPairs()
          .value()
      alignments

    $scope.showAlignmentModal = (task, ilo, alignment) ->
      TaskILOAlignmentModal.show task, ilo, alignment, $scope.unit, $scope.project, $scope.source

    $scope.alignmentForTaskAndIlo = (task, ilo) ->
      if task.definition
        result = alignments[task.definition.id]?[ilo.id]
        td = task.definition
      else
        result = alignments[task.id]?[ilo.id]
        td = task

      result

    $scope.disableInclude = (task) ->
      # if there are no ILOs, you can always include tasks
      if $scope.unit.ilos.length > 0
        alignments[task.definition.id] is undefined
      else
        false

    $scope.includeTaskInPorfolio = (task) ->
      task.includeInPortfolio = !task.includeInPortfolio
      newTaskService.update(task).subscribe({
        next: (success) -> alertService.add("success", "Task updated")
        error: (message) -> alertService.add("danger", message)
      })


    # CSV stuff
    $scope.csvImportResponse = {}
    $scope.taskAlignmentCSV = { file: { name: 'Task Outcome Link CSV', type: 'csv'  } }

    $scope.isTaskCSVUploading = null
    $scope.onTaskAlignmentCSVSuccess = (response) ->
      CsvResultModal.show 'Task CSV upload results.', response
      $rootScope.$broadcast('UpdateAlignmentChart', response, { batch: true })
      if $scope.project?
        $scope.project.refresh($scope.unit)
      else
        $scope.unit.refresh()
    $scope.onTaskAlignmentCSVComplete = ->
      $scope.isTaskCSVUploading = null

    $scope.downloadTaskAlignmentCSV = ->
      if $scope.project?
        fileDownloaderService.downloadFile($scope.project.taskAlignmentCSVUploadUrl, "#{$scope.project.student.name}-alignments.csv")
      else
        fileDownloaderService.downloadFile($scope.unit.taskAlignmentCSVUploadUrl, "#{$scope.unit.code}-alignments.csv")
)
