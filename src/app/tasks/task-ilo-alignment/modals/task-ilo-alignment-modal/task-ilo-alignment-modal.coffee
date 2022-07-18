angular.module('doubtfire.tasks.task-ilo-alignment.modals.task-ilo-alignment-modal', [])

#
# Shows a modal where users can align tasks to ILOs
#
.factory('TaskILOAlignmentModal', ($modal) ->
  TaskILOAlignmentModal = {}

  TaskILOAlignmentModal.show = (task, ilo, alignment, unit, project, source) ->
    $modal.open
      controller: 'TaskILOAlignmentModalCtrl'
      templateUrl: 'tasks/task-ilo-alignment/modals/task-ilo-alignment-modal/task-ilo-alignment-modal.tpl.html'
      resolve:
        task: -> task
        ilo: -> ilo
        alignment: -> alignment
        unit: -> unit
        project: -> project
        source: -> source

  TaskILOAlignmentModal
)

.controller('TaskILOAlignmentModalCtrl', ($scope, $rootScope, $modalInstance, newTaskOutcomeAlignmentService, alertService, task, ilo, alignment, unit, project, source) ->
  $scope.source = source
  $scope.unit = unit
  $scope.task = task
  $scope.ilo = ilo
  $scope.alignment = alignment
  $scope.project = project

  if !$scope.alignment
    $scope.alignment = newTaskOutcomeAlignmentService.createInstanceFrom({}, $scope.source)
    $scope.alignment.learningOutcome = $scope.ilo
    $scope.alignment.taskDefinition = task.definition
    $scope.alignment.rating = 0
    $scope.alignment.description = ""

  $scope.editingRationale = false

  $scope.toggleEditRationale = ->
    if $scope.editingRationale
      updateAlignment()
    $scope.editingRationale = !$scope.editingRationale

  $scope.removeAlignmentItem = ->
    if $scope.project?
      params = {
        project_id: $scope.project.id
      }
    newTaskOutcomeAlignmentService.delete($scope.alignment, {cache: $scope.alignment.within.taskOutcomeAlignmentsCache, params: params}).subscribe({
      next: (response) ->
        alertService.add("success", "Task - Outcome alignment rating removed", 2000)
        $rootScope.$broadcast('UpdateAlignmentChart')
        $modalInstance.close $scope.alignment
      error: (message) -> alertService.add("danger", message, 6000)
    })

  updateAlignment = ->
    if $scope.project?
      params = {
        project_id: $scope.project.id
      }
    newTaskOutcomeAlignmentService.update($scope.alignment, {cache: $scope.alignment.within.taskOutcomeAlignmentsCache, params: params}).subscribe({
      next: (response) ->
        alertService.add("success", "Task - Outcome alignment rating saved", 2000)
        $rootScope.$broadcast('UpdateAlignmentChart')
      error: (message) -> alertService.add("danger", message, 6000)
    })

  addAlignment = ->
    if $scope.project?
      params = {
        project_id: $scope.project.id
      }
    newTaskOutcomeAlignmentService.store($scope.alignment, {cache: $scope.source.taskOutcomeAlignmentsCache, constructorParams: $scope.source, params: params}).subscribe({
      next: (response) ->
        $scope.alignment = response
        $rootScope.$broadcast('UpdateAlignmentChart')
      error: (message) -> alertService.add("danger", message, 6000)
    })

  $scope.updateRating = (alignment) ->
    unless $scope.alignment.id?
      addAlignment alignment
    else
      updateAlignment alignment

  $scope.closeModal = ->
    if $scope.editingRationale
      $scope.updateRating $scope.alignment
    $modalInstance.close $scope.alignment
)
