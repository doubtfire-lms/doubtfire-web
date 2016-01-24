angular.module('doubtfire.units.partials.unit-outcome-alignment',[
  'doubtfire.units.partials.unit-outcome-alignment-modal'
])

.directive('unitOutcomeAlignment', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-outcome-alignment.tpl.html'
  scope:
    unit: "="
    project: "=?"
    showCsv: "="
    hidePanel: '=?'
    hideGraph: '=?'
    # select tasks to include in portfolio
    showIncludeTasks: '=?'
  controller: ($scope, $modal, $rootScope, $filter, currentUser, unitService, alertService, gradeService, LearningAlignments, projectService, taskService, Visualisation, TaskAlignment, csvResultService, outcomeService) ->
    $scope.showTaskName = $scope.unit.ilos.length < 5

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

    # alignments[task_definition_id][ilo_id]
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
                  .object()
                  .value()
            [i, d]
          .object()
          .value()

    $scope.showAlignmentModal = (task, ilo, alignment) ->
      $modal.open
        controller: 'UnitOutcomeAlignmentModal'
        templateUrl: 'units/partials/templates/unit-outcome-alignment-modal.tpl.html'
        resolve:
          task: -> task.definition
          ilo: -> ilo
          alignment: -> alignment
          unit: -> $scope.unit
          project: -> $scope.project
          source: -> $scope.source

    $scope.alignmentForTaskAndIlo = (task, ilo) ->
      alignments[task.definition.id]?[ilo.id]

    $scope.disableInclude = (task) ->
      alignments[task.definition.id] is undefined

    $scope.includeTaskInPorfolio = (task) ->
      task.include_in_portfolio = !task.include_in_portfolio
      Task.update { project_id: $scope.project.project_id, task_definition_id: task.definition.id, include_in_portfolio: task.include_in_portfolio },
        (success) ->
          task.include_in_portfolio = success.include_in_portfolio

    # CSV stuff
    $scope.csvImportResponse = {}
    $scope.taskAlignmentCSV = { file: { name: 'Task Outcome Link CSV', type: 'csv'  } }
    $scope.taskAlignmentCSVUploadUrl = () ->
      if $scope.project?
        TaskAlignment.taskAlignmentCSVUploadUrl($scope.unit, $scope.project.project_id)
      else
        TaskAlignment.taskAlignmentCSVUploadUrl($scope.unit, null)
    $scope.isTaskCSVUploading = null
    $scope.onTaskAlignmentCSVSuccess = (response) ->
      csvResultService.show 'Task CSV upload results.', response
      $rootScope.$broadcast('UpdateAlignmentChart', response, { batch: true })
      if $scope.project?
        $scope.project.refresh($scope.unit)
      else
        $scope.unit.refresh()
    $scope.onTaskAlignmentCSVComplete = () ->
      $scope.isTaskCSVUploading = null

    $scope.downloadTaskAlignmentCSV = () ->
      if $scope.project?
        TaskAlignment.downloadCSV($scope.unit, $scope.project.project_id)
      else
        TaskAlignment.downloadCSV($scope.unit, null)
)
