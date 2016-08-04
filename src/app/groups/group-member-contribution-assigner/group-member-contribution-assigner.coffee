#
# Directive to rate each student's contributions
# in a group task assessment
#
mod = angular.module('doubtfire.groups.group-member-contribution-assigner', [])

.directive('groupMemberContributionAssigner', ->
  restrict: 'E'
  template: require('./group-member-contribution-assigner.tpl.html')
  replace: true
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

    $scope.percentages = {
      danger: 0,
      warning: 25,
      info: 50,
      success: 100
    }

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

module.exports = mod.name
