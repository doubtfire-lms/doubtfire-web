angular.module('doubtfire.units.partials.unit-outcome-alignment-modal',[])

.controller 'UnitOutcomeAlignmentModal', ($scope, $rootScope, $modalInstance, LearningAlignments, alertService, projectService, task, ilo, alignment, unit, project, source) ->
  $scope.source = source
  $scope.unit = unit
  $scope.task = task
  $scope.ilo = ilo
  $scope.alignment = alignment
  $scope.project = project

  if $scope.project
    updateRequest = (data) ->
      data.task_id = projectService.taskFromTaskDefId($scope.project, data.task_definition_id).id

  $scope.editingRationale = false

  $scope.toggleEditRationale = ->
    if $scope.editingRationale
      $scope.saveTaskAlignment(alignment, alignment.id)
    $scope.editingRationale = !$scope.editingRationale

  $scope.removeAlignmentItem = ->
    data = _.extend { unit_id: $scope.unit.id }, $scope.alignment
    LearningAlignments.delete(data,
      (response) ->
        $scope.source.task_outcome_alignments = _.without $scope.source.task_outcome_alignments, response
        $scope.alignment = undefined
        $rootScope.$broadcast('UpdateAlignmentChart', data, { remove: true })
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)
    )

  updateAlignment = ->
    data = _.extend { unit_id: $scope.unit.id }, $scope.alignment
    LearningAlignments.update(data,
      (response) ->
        alertService.add("success", "Task - Outcome alignment rating saved", 2000)
        $rootScope.$broadcast('UpdateAlignmentChart', response, { updated: true })
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)
    )

  addAlignment = ->
    $scope.alignment = data = {
      unit_id: $scope.unit.id
      learning_outcome_id: $scope.ilo.id
      task_definition_id: $scope.task.id
      rating: $scope.alignment.rating
      description: null
    }

    if $scope.project
      data.project_id = $scope.project.project_id
      updateRequest data

    LearningAlignments.create data,
      (response) ->
        $scope.source.task_outcome_alignments.push(response)
        $scope.alignment = response
        $rootScope.$broadcast('UpdateAlignmentChart', response, { created: true })
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)

  $scope.updateRating = (alignment) ->
    unless $scope.alignment.id?
      addAlignment alignment
    else
      updateAlignment alignment

  $scope.closeModal = $modalInstance.dismiss
