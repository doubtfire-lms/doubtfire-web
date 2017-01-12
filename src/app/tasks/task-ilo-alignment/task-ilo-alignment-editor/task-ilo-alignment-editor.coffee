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
  controller: ($scope, $modal, $rootScope, $filter, currentUser, unitService, alertService, gradeService, LearningAlignments, projectService, taskService, Visualisation, TaskAlignment, Task, CsvResultModal, outcomeService, TaskILOAlignmentModal) ->
    $scope.showTaskName = $scope.unit.ilos.length < 5
    $scope.showGraph = false
    $scope.closeGraph = ->
      $scope.showGraph = false
    # Set source
    if $scope.project?
      $scope.source = $scope.project
      $scope.tasks = $scope.project.tasks
      $scope.taskStatusFactor = outcomeService.projectTaskStatusFactor($scope.project)
    else
      $scope.source = $scope.unit
      $scope.tasks = _.map $scope.unit.task_definitions, (td) ->
        { definition: td }
      $scope.taskStatusFactor = outcomeService.unitTaskStatusFactor()

    alignments = []
    $scope.$watch 'source.task_outcome_alignments.length', ->
      return unless $scope.source.task_outcome_alignments?
      alignments =
        _ .chain($scope.source.task_outcome_alignments)
          .filter( (d) -> d.rating > 0 )
          .groupBy('task_definition_id')
          .map (d, i) ->
            d = _ .chain(d)
                  .groupBy('learning_outcome_id')
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
      alignments[task.definition.id]?[ilo.id]

    $scope.disableInclude = (task) ->
      # if there are no ILOs, you can always include tasks
      if $scope.unit.ilos.length > 0
        alignments[task.definition.id] is undefined
      else
        false

    $scope.includeTaskInPorfolio = (task) ->
      task.include_in_portfolio = !task.include_in_portfolio
      Task.update { project_id: $scope.project.project_id, task_definition_id: task.definition.id, include_in_portfolio: task.include_in_portfolio },
        (success) ->
          task.include_in_portfolio = success.include_in_portfolio

    # CSV stuff
    $scope.csvImportResponse = {}
    $scope.taskAlignmentCSV = { file: { name: 'Task Outcome Link CSV', type: 'csv'  } }
    $scope.taskAlignmentCSVUploadUrl = ->
      if $scope.project?
        TaskAlignment.taskAlignmentCSVUploadUrl($scope.unit, $scope.project.project_id)
      else
        TaskAlignment.taskAlignmentCSVUploadUrl($scope.unit, null)
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
        TaskAlignment.downloadCSV($scope.unit, $scope.project.project_id)
      else
        TaskAlignment.downloadCSV($scope.unit, null)
)
