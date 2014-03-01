angular.module('doubtfire.tasks.partials.modals', [])
.controller('AssessTaskModalCtrl', ($scope, task) ->
  statusLabels = {
    'ready_to_mark':      'Ready to Mark',
    'not_ready_to_mark':  'Not Ready to Mark',
    'working_on_it':      'Working On It',
    'need_help':          'Need Some Help'
  }

  statusIcons = {
    'ready_to_mark':      'fa fa-thumbs-o-up',
    'not_ready_to_mark':  'fa fa-times',
    'working_on_it':      'fa fa-bolt',
    'need_help':          'fa fa-question-circle'
  }

  $scope.task = task
  $scope.task.status = 'not_ready_to_mark'

  $scope.$watch 'task.status', ->
    $scope.taskClass = _.trim(_.dasherize($scope.task.status), '-')
    $scope.taskStatusLabel = statusLabels[$scope.task.status]

  $scope.engageWithTask = (status) ->
    $scope.task.status = status

  $scope.readyToAssessStatuses = ['ready_to_mark', 'not_ready_to_mark']
  $scope.engagementStatuses    = ['working_on_it', 'need_help']

  $scope.taskEngagementConfig = {
    readyToAssess: $scope.readyToAssessStatuses.map (status) ->
      { status: status, label: statusLabels[status], iconClass: statusIcons[status] }
    engagement: $scope.engagementStatuses.map (status) ->
      { status: status, label: statusLabels[status], iconClass: statusIcons[status] }
  }
)