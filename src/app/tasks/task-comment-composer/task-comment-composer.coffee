angular.module("doubtfire.tasks.task-comment-composer", [])

#
# Allows a new comment to be created and added to a task
# Includes the ability to create and add audio, text, and image comments
#
.directive('taskCommentComposer', ->
  restrict: 'E'
  templateUrl: 'tasks/task-comment-composer/task-comment-composer.tpl.html'
  scope:
    task: '='
    comment: '=ngModel'
    singleDropZone: '=?'
  controller: ($scope, $modal, $state, $sce, $timeout, CommentResourceService, CommentsModal, listenerService, currentUser, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService, analyticsService) ->
    $scope.emojis = [{
      "unicode": "1f600",
      "unicode_alternates": "(11)",
      "name": "grinning face",
      "shortname": ":grinning:",
      "category": "people",
      "emoji_order": "1",
      "aliases": [],
      "aliases_ascii": [],
      "keywords": ["happy", "joy", "smile", "grin", "smiling", "smiley", "person"]
    }, {
      "unicode": "1f62c",
      "unicode_alternates": "(12)",
      "name": "grimacing face",
      "shortname": ":grimacing:",
      "category": "people",
      "emoji_order": "2",
      "aliases": [],
      "aliases_ascii": [],
      "keywords": ["teeth", "grimace", "disapprove", "pain", "person"]
    }, {
      "unicode": "1f601",
      "unicode_alternates": "(13)",
      "name": "grinning face with smiling eyes",
      "shortname": ":grin:",
      "category": "people",
      "emoji_order": "3",
      "aliases": [],
      "aliases_ascii": [],
      "keywords": ["happy", "joy", "smile", "grin", "smiley", "eye", "person"]
    }, {
      "unicode": "1f602",
      "unicode_alternates": "(14)",
      "name": "face with tears of joy",
      "shortname": ":joy:",
      "category": "people",
      "emoji_order": "4",
      "aliases": [],
      "aliases_ascii": [":')", ":'-)"],
      "keywords": ["cry", "haha", "happy", "weep", "person", "tear"]
    }, {
      "unicode": "1f603",
      "unicode_alternates": "(15)",
      "name": "smiling face with open mouth",
      "shortname": ":smiley:",
      "category": "people",
      "emoji_order": "5",
      "aliases": [],
      "aliases_ascii": [":D", ":-D", "=D"],
      "keywords": ["haha", "happy", "joy", "smile", "smiley", "person"]
    }, {
      "unicode": "1f604",
      "unicode_alternates": "(16)",
      "name": "smiling face with open mouth and smiling eyes",
      "shortname": ":smile:",
      "category": "people",
      "emoji_order": "6",
      "aliases": [],
      "aliases_ascii": [":)", ":-)", "=]", "=)", ":]"],
      "keywords": ["funny", "haha", "happy", "joy", "laugh", "smile", "smiley", "eye", "person"]
    }, {
      "unicode": "1f605",
      "unicode_alternates": "(17)",
      "name": "smiling face with open mouth and cold sweat",
      "shortname": ":sweat_smile:",
      "category": "people",
      "emoji_order": "7",
      "aliases": [],
      "aliases_ascii": ["':)", "':-)", "'=)", "':D", "':-D", "'=D"],
      "keywords": ["happy", "hot", "perspiration", "smile", "person"]
    }, {
      "unicode": "1f606",
      "unicode_alternates": "(21)",
      "name": "smiling face with open mouth and tightly-closed eyes",
      "shortname": ":laughing:",
      "category": "people",
      "emoji_order": "8",
      "aliases": [":satisfied:"],
      "aliases_ascii": [">:)", ">;)", ">:-)", ">=)"],
      "keywords": [":happy:", "joy", "lol", "laughing", "laugh", "person", "satisfied", "smile"]
    },  {
      "unicode": "1F923",
      "unicode_alternates": "(22)"
    },  {
      "unicode": "1F642",
      "unicode_alternates": "(23)"
    },  {
      "unicode": "1F643",
      "unicode_alternates": "(24)"
    },  {
      "unicode": "1F609",
      "unicode_alternates": "(25)"
    },  {
      "unicode": "1F60A",
      "unicode_alternates": "(26)"
    },  {
      "unicode": "1F618",
      "unicode_alternates": "(27)"
    },  {
      "unicode": "1F617",
      "unicode_alternates": "(31)"
    },  {
      "unicode": "1F619",
      "unicode_alternates": "(32)"
    },  {
      "unicode": "1F60B",
      "unicode_alternates": "(33)"
    },  {
      "unicode": "1F61B",
      "unicode_alternates": "(34)"
    },  {
      "unicode": "1F61C",
      "unicode_alternates": "(35)"
    },  {
      "unicode": "1F92A",
      "unicode_alternates": "(36)"
    },  {
      "unicode": "1F61D",
      "unicode_alternates": "(37)"
    },  {
      "unicode": "1F911",
      "unicode_alternates": "(41)"
    },  {
      "unicode": "1F917",
      "unicode_alternates": "(42)"
    },  {
      "unicode": "1F99B",
      "unicode_alternates": "(43)"
    },  {
      "unicode": "1F92B",
      "unicode_alternates": "(44)"
    },  {
      "unicode": "1F914",
      "unicode_alternates": "(45)"
    },  {
      "unicode": "1F910",
      "unicode_alternates": "(46)"
    },  {
      "unicode": "1F92B",
      "unicode_alternates": "(47)"
    },  {
      "unicode": "1F610",
      "unicode_alternates": "(51)"
    },  {
      "unicode": "1F611",
      "unicode_alternates": "(52)"
    },  {
      "unicode": "1F636",
      "unicode_alternates": "(53)"
    },  {
      "unicode": "1F60F",
      "unicode_alternates": "(54)"
    },  {
      "unicode": "1F612",
      "unicode_alternates": "(55)"
    },  {
      "unicode": "1F644",
      "unicode_alternates": "(56)"
    },  {
      "unicode": "1F62C",
      "unicode_alternates": "(57)"
    },  {
      "unicode": "1F925",
      "unicode_alternates": "(61)"
    },  {
      "unicode": "1F60C",
      "unicode_alternates": "(62)"
    },  {
      "unicode": "1F614",
      "unicode_alternates": "(63)"
    },  {
      "unicode": "1F62A",
      "unicode_alternates": "(64)"
    },  {
      "unicode": "1F924",
      "unicode_alternates": "(65)"
    },  {
      "unicode": "1F634",
      "unicode_alternates": "(66)"
    },  {
      "unicode": "1F637",
      "unicode_alternates": "(67)"
    },  {
      "unicode": "1F915",
      "unicode_alternates": "(71)"
    },  {
      "unicode": "1F922",
      "unicode_alternates": "(72)"
    },  {
      "unicode": "1F92E",
      "unicode_alternates": "(73)"
    },  {
      "unicode": "1F60E",
      "unicode_alternates": "(74)"
    },  {
      "unicode": "1F9D2",
      "unicode_alternates": "(75)"
    },  {
      "unicode": "1F9D2",
      "unicode_alternates": "(76)"
    },  {
      "unicode": "1F476",
      "unicode_alternates": "(77)"
    },  {
      "unicode": "1F467",
      "unicode_alternates": "(81)"
    },  {
      "unicode": "1F474",
      "unicode_alternates": "(82)"
    },  {
      "unicode": "1F475",
      "unicode_alternates": "(83)"
    },  {
      "unicode": "1F937",
      "unicode_alternates": "(84)"
    },  {
      "unicode": "1F468",
      "unicode_alternates": "(85)"
    },  {
      "unicode": "1F983",
      "unicode_alternates": "(86)"
    }, {
      "unicode": "1f607",
      "unicode_alternates": "(87)",
      "name": "smiling face with halo",
      "shortname": ":innocent:",
      "category": "people",
      "emoji_order": "9",
      "aliases": [],
      "aliases_ascii": ["O:-)", "0:-3", "0:3", "0:-)", "0:)", "0;^)", "O:)", "O;-)", "O=)", "0;-)", "O:-3", "O:3"],
      "keywords": ["angel", "innocent", "ring", "circle", "heaven", "fairy tale", "fantasy", "person", "smile"]
    }]

    $scope.isRecorderOpen = false
    $scope.isEmojiOpen = false
    # Initialise comment
    $scope.comment = {
      text: ""
      type: "text"
    }

    $scope.emojiPopover = 'emojiSelectorPopover.html'
    $scope.audioPopover = 'audioRecorderPopover.html'

    # Don't insert a newline character when sending a comment
    $scope.keyPress = (e) ->
      if (e.key.toLowerCase() == "enter" && !e.shiftKey)
        e.preventDefault()
        len = $scope.emojis.length
        for i in [0...len-1]
          if($scope.emojis[i].unicode_alternates != "")
            console.log($scope.emojis[i].unicode_alternates)
            console.log($scope.comment.text.indexOf($scope.emojis[i].unicode_alternates))
            if ($scope.comment.text.indexOf($scope.emojis[i].unicode_alternates) == 0)
              $scope.comment.text = $scope.comment.text.replace($scope.emojis[i].unicode_alternates, "&#x" + $scope.emojis[i].unicode + ';')
        if $scope.comment.text.trim() != ""
          $scope.addComment()

    $scope.formatImageName = (imageName) ->
      index = imageName.indexOf(".")
      nameString = imageName.substring(0,index)
      typeString = imageName.substring(index)

      if nameString.length > 20
        nameString = nameString.substring(0,20) + ".."

      finalString = nameString + typeString
      finalString

    #============================================================================
    $scope.clearEnqueuedUpload = (upload) ->
      upload.model = null
      refreshShownUploadZones()

    #============================================================================
    # Upload image files as comments to a given task
    $scope.postAttachmentComment = ->
      taskService.addMediaComment(CommentResourceService.task, $scope.upload.model[0],
        (success) ->
          taskService.scrollDown()
        (failure) ->
          alertService.add('danger', "Failed to post image. #{failure.data?.error}")
      )
      $scope.clearEnqueuedUpload($scope.upload)

    #============================================================================
    # Will refresh which shown drop zones are shown
    # Only changes if showing one drop zone
    refreshShownUploadZones = ->
      if $scope.singleDropZone
        # Find the first-most empty model in each zone
        firstEmptyZone = _.find($scope.uploadZones, (zone) -> !zone.model? || zone.model.length == 0)
        if firstEmptyZone?
          $scope.shownUploadZones = [firstEmptyZone]
        else
          $scope.shownUploadZones = []

    $scope.addComment = ->
      $scope.comment.text = $scope.comment.text.trim()
      taskService.addComment $scope.task, $scope.comment.text, "text",
        (success) ->
          $scope.comment.text = ""
          analyticsService.event "View Task Comments", "Added new comment"
          taskService.scrollDown()
        (failure) -> #changed from response to failure
          alertService.add("danger", failure.data.error, 2000)
)
