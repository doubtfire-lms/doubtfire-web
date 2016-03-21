angular.module('doubtfire.tasks.task-feedback-assessor',[])

#
# Directive that allows input to provide feedback for a task.
# It displays the task submission, shows a task comment viewer
# and a task status selector
#
.directive('taskFeedbackAssessor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-feedback-assessor/task-feedback-assessor.tpl.html'
  scope:
    task: "=task"
    unit: "=unit"
    assessingUnitRole: "=assessingUnitRole"
    unitRole: "=unitRole"
    onStatusUpdate: "=onStatusUpdate"
    viewOptions: "="
  controller: ($scope, taskService) ->

    $scope.comment = { text: "" }

    $scope.triggerTransition = (status) ->
      if $scope.comment.text.length > 0
        # Firstly, try to add a comment
        taskService.addComment $scope.task, $scope.comment.text,
          (success) ->
            # If the comment was successful then reset text and trigger transition
            $scope.comment.text = ""
      # Always trigger status update
      taskService.updateTaskStatus $scope.unit, $scope.task.project(), $scope.task, status

    if $scope.onStatusUpdate? && _.isFunction($scope.onStatusUpdate)
      $scope.$on 'TaskStatusUpdated', (event, args) ->
        $scope.onStatusUpdate(args.status)
)
