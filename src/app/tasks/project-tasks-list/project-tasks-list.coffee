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

  controller: ($scope, $modal, taskService, groupService, analyticsService, gradeService) ->
    analyticsService.event 'Student Project View', "Showed Task Button List"

    # functions from task service
    $scope.statusClass = taskService.statusClass
    $scope.statusText = taskService.statusText
    $scope.taskDefinition = taskService.taskDefinitionFn($scope.unit)

    $scope.taskDisabled = (task) ->
      $scope.taskDefinition(task).target_grade > $scope.project.target_grade

    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit)

    $scope.hideGroupSetName = $scope.unit.group_sets.length is 0

    $scope.taskText = (task) ->
      result = task.definition.abbreviation

      if task.definition.is_graded
        if task.grade?
          result += " (" + gradeService.gradeAcronyms[task.grade] + ")"
        else
          result += " (?)"
      
      if task.definition.max_quality_pts > 0
        if task.quality_pts?
          result += " (" + task.quality_pts + "/" + task.definition.max_quality_pts + ")"
        else
          result += " (?/" + task.definition.max_quality_pts + ")"
      
      result
)
