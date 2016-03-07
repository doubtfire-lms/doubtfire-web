angular.module('doubtfire.tasks.task-ilo-alignment.task-ilo-alignment-rater',[])

#
# A star-based rater where the strength of an alignment between a
# task and an ILO can be specified, along with a provided rationale
# for that strength
#
.directive('taskIloAlignmentRater', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-ilo-alignment/task-ilo-alignment-rater/task-ilo-alignment-rater.tpl.html'
  scope:
    readonly: '=?'
    # pass in whole align object
    ngModel:  '='
    unit: '='
    # Function to call when rating is changed
    onRatingChanged: '=?'
    # Show tooltip when hovering (defaults to true)
    tooltips: '=?'
    # Is in colour? (defaults to true)
    colorful: '=?'
    # Show static tooltip for selected rating (defaults to true)
    selectedTooltip: '=?'
    # Show as tooltips instead (false)
    showTooltips: '=?'
    # Compact version
    compact: '=?'
  controller: ($scope) ->
    $scope.max = 5

    $scope.readonly = true if $scope.compact

    $scope.tooltips = [
      "The task is slightly related to this outcome",
      "The task is related to this outcome",
      "The task is a reasonable example for this outcome",
      "The task is a strong example of this outcome",
      "The task is the best example of this outcome",
    ]

    $scope.setHoverValue = (value) ->
      return $scope.ngModel if $scope.readonly and not $scope.showTooltips
      $scope.hoveringOver = value

    # Set defaults
    for property in ['tooltips', 'colorful', 'selectedTooltip']
      $scope[property] = if $scope[property]? then $scope[property] else true

    $scope.showTooltips = if $scope.showTooltips? then $scope.showTooltips else false

    if $scope.onRatingChanged?
      $scope.$watch 'ngModel.rating', (newValue, oldValue) ->
        if newValue? and newValue isnt oldValue
          $scope.onRatingChanged($scope.ngModel)
)
