angular.module('doubtfire.tasks.partials.modals.grade-task-modal', [])
.factory('GradeTaskModal', ($modal) ->
  GradeTaskModal = {}

  #
  # Open a grade task modal with the provided task
  #
  GradeTaskModal.show = (task) ->
    $modal.open
      templateUrl: 'tasks/partials/templates/grade-task-modal.tpl.html'
      controller: 'GradeTaskModal'
      resolve:
        task: -> task

  GradeTaskModal
)
.controller('GradeTaskModal', ($scope, $modalInstance, gradeService, task) ->
  $scope.task = task
  $scope.data = { desiredGrade: null }
  $scope.grades = gradeService.grades
  $scope.dismiss = $modalInstance.dismiss
  $scope.close = ->
    $modalInstance.close $scope.data.desiredGrade
)
