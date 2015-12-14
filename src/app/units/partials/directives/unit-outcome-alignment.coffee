angular.module('doubtfire.units.partials.unit-outcome-alignment',[])

.directive('unitOutcomeAlignment', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-outcome-alignment.tpl.html'
  scope:
    unit: "=unit"
    project: "=project"
    showCsv: "=showCsv"

  controller: ($scope, $rootScope, $filter, currentUser, unitService, alertService, gradeService, LearningAlignments, projectService, taskService, Visualisation, TaskAlignment, csvResultService, outcomeService) ->
    if $scope.project?
      $scope.source = $scope.project
      $scope.updateRequest = (data) ->
        data.task_id = projectService.taskFromTaskDefId($scope.project, data.task_definition_id).id
      $scope.taskStatusFactor = outcomeService.projectTaskStatusFactor($scope.project)
    else
      $scope.source = $scope.unit
      $scope.updateRequest = (data) ->
      $scope.taskStatusFactor = outcomeService.unitTaskStatusFactor()

    $scope.selectOutcome = (outcome) ->
      $scope.selectedOutcome = outcome
      $scope.selectedTask = null

    $scope.selectTask = (task) ->
      $scope.selectedOutcome = null
      $scope.selectedTask = task

    # Generalise selection
    $scope.selectAlignmentByItem = (item) ->
      item.selected = true
      $scope["select#{$scope.selectAlignmentBy}"](item)
      $scope.selectedAlignmentByItem = item
      $scope.selectedInverseAlignmentItem = null

    $scope.$watch 'selectAlignmentBy', (newValue) ->
      # Needs to be an object containing array for ui.select
      $scope.selected = { items: [], propertyFilter: '' }
      if $scope.unit.ilos.length > 0 and newValue is 'Outcome'
        $scope.selectAlignmentByItems = $scope.unit.ilos
        defaultSelection = _.chain($scope.unit.ilos)
                            .sortBy((item) -> item.ilo_number)
                            .first()
                            .value()
        $scope.selectAlignmentByItem(defaultSelection)
        $scope.inverseSelectAlignmentBy = 'Task'
        $scope.inverseSelectAlignmentByItems = $scope.unit.task_definitions
      else if $scope.unit.task_definitions.length > 0 and newValue is 'Task'
        $scope.selectAlignmentByItems = $scope.unit.task_definitions
        defaultSelection = _.chain($scope.unit.task_definitions)
                            .sortBy((item) -> item.seq)
                            .first()
                            .value()
        $scope.selectAlignmentByItem(defaultSelection)
        $scope.inverseSelectAlignmentBy = 'Outcome'
        $scope.inverseSelectAlignmentByItems = $scope.unit.ilos
    $scope.selectAlignmentBy = 'Outcome'

    updateSelectAlignmentItems = (newAlignments) ->
      filterOut = if $scope.selectAlignmentBy is 'Outcome' then 'learning_outcome_id' else 'task_definition_id'
      onlyConsider = {}
      onlyConsider[filterOut] = $scope.selectedAlignmentByItem.id
      # Populate selected items from current task_outcome_alignments
      # Needs to also match currently selected outcome or task
      $scope.selected.items =
        _ .chain($scope.source.task_outcome_alignments)
          .where(onlyConsider)
          .map((align) ->
            useAlignId = if $scope.selectAlignmentBy is 'Outcome' then 'task_definition_id' else 'learning_outcome_id'
            # match the selected property filter and selectedAlignmentByItem.id
            _.findWhere $scope.inverseSelectAlignmentByItems, { id: align[useAlignId] }
          )
          .value()

    $scope.$watch 'source.task_outcome_alignments', updateSelectAlignmentItems
    $scope.$watch 'selectedAlignmentByItem', updateSelectAlignmentItems
    $scope.$watch 'selectAlignmentBy', updateSelectAlignmentItems

    addLink = (data) ->
      $scope.updateRequest(data)

      LearningAlignments.create data,
        (response) ->
          $scope.source.task_outcome_alignments.push(response)
          $rootScope.$broadcast('UpdateAlignmentChart')
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)

    $scope.addTask = (taskDef) ->
      if $scope.selectedOutcome
        data = {
          unit_id: $scope.unit.id
          learning_outcome_id: $scope.selectedOutcome.id
          task_definition_id: taskDef.id
          rating: 3
          description: null
        }
        addLink(data)

    $scope.addOutcome = (outcome) ->
      if $scope.selectedTask
        data = {
          unit_id: $scope.unit.id
          learning_outcome_id: outcome.id
          task_definition_id: $scope.selectedTask.id
          rating: 3
          description: null
        }
        addLink(data)

    $scope.searchForAlignmentForItem = (item) ->
      return null unless item?
      removeBy = if $scope.selectAlignmentBy is 'Outcome' then 'task_definition_id' else 'learning_outcome_id'
      properties = {}
      properties[removeBy] = item.id
      _.findWhere($scope.filteredAlignments, properties)

    $scope.itemIsAligned = (item) ->
      $scope.searchForAlignmentForItem(item)?

    $scope.isSelectedInverseAlignmentItem = (item) ->
      $scope.selectedInverseAlignmentItem is item

    $scope.selectInverseAlignmentItem = (item) ->
      # deselect
      if item is $scope.selectedInverseAlignmentItem
        $scope.selectedInverseAlignmentItem = null
        return
      $scope.selectedInverseAlignmentItem = item
      # auto-add if not added
      $scope.addAlignmentItem(item) unless $scope.itemIsAligned(item)

    # Generalise add items
    $scope.addAlignmentItem = (item) ->
      $scope["add#{$scope.inverseSelectAlignmentBy}"](item)
    $scope.removeAlignmentItem = (item) ->
      $scope.removeTaskAlignment item
      $scope.selectedInverseAlignmentItem = null

    $scope.saveTaskAlignment = (data, id) ->
      data.unit_id = $scope.unit.id
      data.id = id
      LearningAlignments.update data,
        (response) ->
          alertService.add("success", "Task - Outcome alignment saved", 2000)
          $rootScope.$broadcast('UpdateAlignmentChart')
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)

    $scope.updateRating = (align) ->
      data = { unit_id: $scope.unit.id }
      _.extend(data, align)

      LearningAlignments.update(data,
        (response) ->
          alertService.add("success", "Task - Outcome alignment rating saved", 2000)
          $rootScope.$broadcast('UpdateAlignmentChart')
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )

    $scope.removeTaskAlignment = (align) ->
      data = { unit_id: $scope.unit.id }
      _.extend(data, align)

      LearningAlignments.delete(data,
        (response) ->
          $scope.source.task_outcome_alignments = _.without $scope.source.task_outcome_alignments, align
          $rootScope.$broadcast('UpdateAlignmentChart')
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )

    $scope.toggleEditRationale = (align) ->
      if align.editingRationale
        data = align
        data.editingRationale = undefined
        $scope.saveTaskAlignment(data, align.id)
      else
        align.editingRationale = !align.editingRationale

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
      $rootScope.$broadcast('UpdateAlignmentChart')
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
