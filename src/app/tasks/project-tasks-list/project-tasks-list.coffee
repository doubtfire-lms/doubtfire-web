angular.module('doubtfire.tasks.project-tasks-list', [])

#
# Displays the tasks associated with a student's project which
# when a task is clicked will automatically jump to the task viewer
# of the task that was clicked
#
.directive('projectTasksList', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/project-tasks-list/project-tasks-list.tpl.html'
  scope:
    unit: "="
    project: "="
    onSelect: "="
    inMenu: '@'

  controller: ($scope, $modal, newTaskService, analyticsService, gradeService) ->
    analyticsService.event 'Student Project View', "Showed Task Button List"

    # functions from task service
    $scope.statusClass = newTaskService.statusClass
    $scope.statusText = newTaskService.statusText

    $scope.taskDisabled = (task) ->
      task.definition.targetGrade > $scope.project.targetGrade

    $scope.groupSetName = (id) ->
      $scope.unit.groupSetsCache.get(id)?.name || "Individual Work"

    $scope.hideGroupSetName = $scope.unit.groupSets.length is 0

    $scope.taskText = (task) ->
      result = task.definition.abbreviation

      if task.definition.isGraded
        if task.grade?
          result += " (" + gradeService.gradeAcronyms[task.grade] + ")"
        else
          result += " (?)"

      if task.definition.maxQualityPts > 0
        if task.qualityPts?
          result += " (" + task.qualityPts + "/" + task.definition.maxQualityPts + ")"
        else
          result += " (?/" + task.definition.maxQualityPts + ")"

      result
)
