angular.module('doubtfire.groups.group-member-contribution-assigner', [])

#
# Directive to rate each student's contributions
# in a group task assessment
#
.directive('groupMemberContributionAssigner', ->
  restrict: 'E'
  templateUrl: 'groups/group-member-contribution-assigner/group-member-contribution-assigner.tpl.html'
  replace: true
  scope:
    task: '='
    project: '='
    team: '=' #out parameter

  controller: ($scope, gradeService, projectService, groupService, GroupMember) ->
    $scope.selectedGroupSet = $scope.task.definition.group_set
    $scope.selectedGroup = projectService.getGroupForTask $scope.project, $scope.task

    $scope.memberSortOrder = 'student_name'
    $scope.numStars = 5
    $scope.initialStars = 3

    $scope.percentages = {
      danger: 0,
      warning: 25,
      info: 50,
      success: 100
    }

    $scope.checkClearRating = (member) ->
      if member.confRating == 1 && member.overStar == 1 && member.rating == 0
        member.rating = member.percent = 0
      else if member.confRating == 1 && member.overStar == 1 && member.rating == 0
        member.rating = 1
      member.confRating = member.rating

    memberPercentage = (member, rating) ->
      (100 * (rating / groupService.groupContributionSum($scope.team.members, member, rating))).toFixed()

    $scope.hoveringOver = (member, value) ->
      member.overStar = value
      member.percent = memberPercentage(member, value)

    $scope.gradeFor = gradeService.gradeFor

    # TODO: (@alexcu) Supply group members
    if $scope.selectedGroup && $scope.selectedGroupSet
      GroupMember.query { unit_id: $scope.project.unit_id, group_set_id: $scope.selectedGroupSet.id, group_id: $scope.selectedGroup.id }, (members) ->
        $scope.team.members = _.map(members, (member) ->
          member.rating = member.confRating = $scope.initialStars
          member.percent = memberPercentage(member, member.rating)
          member
        )
        # Need the '+' to convert to number
        $scope.percentages.warning = +(25 / members.length).toFixed()
        $scope.percentages.info    = +(50 / members.length).toFixed()
        $scope.percentages.success = +(95 / members.length).toFixed()
    else
      $scope.team.members = []

    $scope.percentClass = (pct) ->
      return 'label-success'  if pct >= $scope.percentages.success
      return 'label-info'     if $scope.percentages.info    <= pct < $scope.percentages.success
      return 'label-warning'  if $scope.percentages.warning <= pct < $scope.percentages.info
      return 'label-danger'   if $scope.percentages.danger  <= pct < $scope.percentages.warning
)
