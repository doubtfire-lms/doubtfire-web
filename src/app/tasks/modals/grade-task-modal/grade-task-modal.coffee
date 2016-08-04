#
# A modal to grade a graded task
#
mod = angular.module('doubtfire.tasks.modals.grade-task-modal', [])

.factory('GradeTaskModal', ($uibModal) ->
  GradeTaskModal = {}

  #
  # Open a grade task modal with the provided task
  #
  GradeTaskModal.show = (task) ->
    $uibModal.open
      template: require('./grade-task-modal.tpl.html')
      controller: 'GradeTaskModal'
      resolve:
        task: -> task

  GradeTaskModal
)
.controller('GradeTaskModal', ($scope, $uibModalInstance, gradeService, task) ->
  $scope.task = task
  $scope.data = { desiredGrade: task.grade, rating: task.quality_pts || 1, overStar: 0, confRating: 0 }
  $scope.grades = gradeService.grades
  $scope.dismiss = $uibModalInstance.dismiss
  $scope.numStars = task.definition.max_quality_pts || 5
  $scope.close = ->
    $uibModalInstance.close { qualityPts: $scope.data.rating, selectedGrade: $scope.data.desiredGrade}

  $scope.hoveringOver = (value) ->
    $scope.data.overStar = value

  $scope.checkClearRating = () ->
    if $scope.data.confRating == 1 && $scope.data.rating == 1 && $scope.data.overStar == 1
      $scope.data.rating = 0
    else if $scope.data.confRating == 1 && $scope.data.overStar == 1 && $scope.data.rating == 0
      $scope.data.rating = 1

    $scope.data.confRating = $scope.data.rating
)

module.exports = mod.name
