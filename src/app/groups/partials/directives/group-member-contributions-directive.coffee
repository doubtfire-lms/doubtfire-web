angular.module('doubtfire.groups.partials.group-member-contribution-directive', [])

.directive('groupMemberContributions', ->
  restrict: 'E'
  templateUrl: 'groups/partials/templates/group-member-contributions.tpl.html'
  scope:
    task: '='
    project: '='
    team: '=' #out parameter

  controller: ($scope, gradeService, projectService, groupService, GroupMember) ->
    $scope.selectedGroupset = $scope.task.definition.group_set
    $scope.selectedGroup = projectService.getGroupForTask $scope.project, $scope.task

    $scope.memberSortOrder = 'student_name'
    $scope.team.members = []
    $scope.numStars = 5
    $scope.initialStars = 3
    $scope.dangerPct = 0
    $scope.warnPct = 25
    $scope.infoPct = 50
    $scope.successPct = 100

    $scope.checkClearRating = (member) ->
      if member.confRating == 1 && member.overStar == 1 && member.rating == 1
        member.rating = 0
        member.percent = 0
      else if member.confRating == 1 && member.overStar == 1 && member.rating == 0
        member.rating = 1

      member.confRating = member.rating

    $scope.hoveringOver = (member, value) ->
      member.overStar = value
      member.percent = (100 * (value / groupService.groupContributionSum($scope.team.members, member, value))).toFixed()

    $scope.gradeFor = gradeService.gradeFor

    if $scope.selectedGroup && $scope.selectedGroupset
      GroupMember.query { unit_id: $scope.project.unit_id, group_set_id: $scope.selectedGroupset.id, group_id: $scope.selectedGroup.id }, (members) ->
        $scope.team.members = members
        $scope.warnPct = (25 / members.length).toFixed()
        $scope.infoPct = (50 / members.length).toFixed()
        $scope.successPct = (95 / members.length).toFixed()
    else
      $scope.team.members = []
)