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
    # Hide labels
    hideLabels: '=?'
    # Compact version
    compact: '=?'
    # Expose label outwards
    label: '=?'
    # Show the zero label
    showZeroRating: '=?'
  controller: ($scope, outcomeService) ->
    $scope.max = 5

    $scope.hideLabels ?= false

    $scope.showZeroRating ?= false

    $scope.readonly = true if $scope.compact

    $scope.tooltips = outcomeService.alignmentLabels

    $scope.setHoverValue = (value) ->
      return $scope.ngModel if $scope.readonly and not $scope.showTooltips
      $scope.hoveringOver = value
      $scope.label = $scope.tooltips[value]

    # Set defaults
    for property in ['tooltips', 'colorful', 'selectedTooltip']
      $scope[property] = if $scope[property]? then $scope[property] else true

    $scope.showTooltips = if $scope.showTooltips? then $scope.showTooltips else false

    if $scope.onRatingChanged?
      $scope.$watch 'ngModel.rating', (newValue, oldValue) ->
        if newValue? and newValue isnt oldValue
          $scope.onRatingChanged($scope.ngModel)
)
