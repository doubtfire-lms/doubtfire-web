angular.module('doubtfire.units.partials.outcome-alignment-rating',[])

.directive('outcomeAlignmentRating', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/outcome-alignment-rating.tpl.html'
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
  controller: ($scope) ->
    $scope.max = 5

    $scope.tooltips = [
      "Rating 1 description",
      "Rating 2 description",
      "Rating 3 description",
      "Rating 4 description",
      "Rating 5 description",
    ]

    $scope.setHoverValue = (value) ->
      $scope.hoveringOver = value

    # Set defaults
    for property in ['tooltips', 'colorful', 'selectedTooltip']
      $scope[property] = if $scope[property]? then $scope[property] else true

    if $scope.onRatingChanged?
      $scope.$watch 'ngModel.rating', (newValue, oldValue) ->
        if newValue? and newValue isnt oldValue
          $scope.onRatingChanged($scope.ngModel)
)