angular.module('doubtfire.tasks.task-ilo-alignment.task-ilo-alignment-viewer', [])

#
# Views the alignment between a task and an ILO, with descriptive
# text of the alignment and ILO
#
.directive('taskIloAlignmentViewer', ->
  restrict: 'E'
  replace: true
  templateUrl: 'tasks/task-ilo-alignment/task-ilo-alignment-viewer/task-ilo-alignment-viewer.tpl.html'
  scope:
    currentProgress: '=?'
    classStats: '=?'
    project: '=?'
    task: '=?'
    unit: '='
    alignments: '=?'
    summaryOnly: '=?'
    hideVisualisation: '=?'
  controller: ($scope, Visualisation, outcomeService) ->
    $scope.hideVisualisation = if $scope.hideVisualisation? then $scope.hideVisualisation else false
    $scope.targets = outcomeService.calculateTargets($scope.unit, $scope.unit, $scope.unit.taskStatusFactor)

    $scope.toggleExpanded = (align) ->
      align.expanded = !align.expanded
      if align.expanded
        Visualisation.refreshAll()

    $scope.alignments = $scope.unit.ilos unless $scope.alignments?

    if $scope.project? and $scope.task?
      $scope.classStats = outcomeService.calculateTaskPotentialContribution($scope.unit, $scope.project, $scope.task)
      $scope.currentProgress = outcomeService.calculateTaskContribution($scope.unit, $scope.project, $scope.task)

)
