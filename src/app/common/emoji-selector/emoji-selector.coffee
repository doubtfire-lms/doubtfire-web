angular.module('doubtfire.common.emoji-selector', [])

.directive 'emojiSelector', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/emoji-selector/emoji-selector.tpl.html'

  controller: ($scope, taskService, alertService) ->
    $scope.emojiArray = ['&#x1F600','&#x1F603','&#x1F604','&#x1F601','&#x1F606','&#x1F605',
                        '&#x1F923','&#x1F602','&#x1F642','&#x1F643','&#x1F609','&#x1F60A',
                        '&#x1F607','&#x1F60D','&#x1F929','&#x1F618','&#x1F617','&#x1F61A',
                        '&#x1F619','&#x1F60B','&#x1F61B','&#x1F61C','&#x1F92A','&#x1F61D',
                        '&#x1F911','&#x1F917','&#x1F92D','&#x1F92B','&#x1F914','&#x1F910',
                        '&#x1F928','&#x1F610','&#x1F611','&#x1F636','&#x1F60F','&#x1F612',
                        '&#x1F644','&#x1F62C','&#x1F925','&#x1F60C','&#x1F614','&#x1F62A',
                        '&#x1F924','&#x1F634','&#x1F637','&#x1F912','&#x1F915','&#x1F922',
                        '&#x1F92E','&#x1F927','&#x1F635','&#x1F92F','&#x1F920','&#x1F60E',
                        '&#x1F913','&#x1F9D0','&#x1F615','&#x1F61F','&#x1F641','&#x2639',
                        '&#x1F62E','&#x1F62F','&#x1F632','&#x1F633','&#x1F626','&#x1F627',
                        '&#x1F628','&#x1F630','&#x1F625','&#x1F622','&#x1F62D','&#x1F631',
                        '&#x1F616','&#x1F623','&#x1F61E','&#x1F613','&#x1F629','&#x1F62B',
                        '&#x1F624','&#x1F621','&#x1F620','&#x1F92C','&#x1F608','&#x1F47F',
                        '&#x1F480','&#x2620' ]

    # Emoji Selector JS
    $scope.copy_emoji = (event) ->
      #alertService.add("info", event.currentTarget.innerHTML, 10000)

      $scope.comment.text = $scope.comment.text + event.currentTarget.innerHTML
      return

.filter('uni', ($sce)->
  (val)->
    return $sce.trustAsHtml(val)
)
