
angular.module('doubtfire.common.on-long-press', [])
  .directive('onLongPress', ($timeout) ->
    return {
      restrict: 'A'
      link: ($scope, $elm, $attrs) ->
        $elm.bind 'touchstart', (evt) ->
        # Locally scoped variable that will keep track of the long press
        $scope.longPress = true
        # We'll set a timeout for 600 ms for a long press
        $timeout (->
          if $scope.longPress
            # If the touchend event hasn't fired,
            # apply the function given in on the element's on-long-press attribute
            $scope.$apply ->
              $scope.$eval $attrs.onLongPress
              return
          return
        ), 600

        $elm.bin 'touchend', (evt) ->
          # Prevent the onLongPress event from firing
          $scope.longPress = false
          # If there is an on-touch-end function attached to this element, apply it
          if $attrs.onTouchEnd
            $scope.$apply ->
              $scope.$eval $attrs.onTouchEnd
              return
          return
    }
)
