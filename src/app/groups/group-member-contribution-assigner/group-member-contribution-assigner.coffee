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

  controller: ($scope, gradeService) ->
    $scope.selectedGroupSet = $scope.task.definition.groupSet
    $scope.selectedGroup = $scope.project.getGroupForTask($scope.task)

    $scope.memberSortOrder = 'project.student.name'
    $scope.numStars = 5
    $scope.initialStars = 3

    $scope.percentages = {
      danger: 0,
      warning: 25,
      info: 50,
      success: 100
    }

    $scope.checkClearRating = (contrib) ->
      if contrib.confRating == 1 && contrib.overStar == 1 && contrib.rating == 0
        contrib.rating = contrib.percent = 0
      else if contrib.confRating == 1 && contrib.overStar == 1 && contrib.rating == 0
        contrib.rating = 1
      contrib.confRating = contrib.rating

    memberPercentage = (contrib, rating) ->
      (100 * (rating / $scope.selectedGroup.contributionSum($scope.team.memberContributions, contrib, rating))).toFixed()

    $scope.hoveringOver = (contrib, value) ->
      contrib.overStar = value
      contrib.percent = memberPercentage(contrib, value)

    $scope.gradeFor = gradeService.gradeFor

    if $scope.selectedGroup && $scope.selectedGroupSet
      $scope.selectedGroup.getMembers().subscribe({
        next: (members) ->
          $scope.team.memberContributions = _.map(members, (member) ->
            result = {
              project: member,
              rating: $scope.initialStars,
              confRating: $scope.initialStars,
              percent: 0
            }
            result.percent = memberPercentage(result, $scope.initialStars)
            result
          )
          # Need the '+' to convert to number
          $scope.percentages.warning = +(25 / members.length).toFixed()
          $scope.percentages.info    = +(50 / members.length).toFixed()
          $scope.percentages.success = +(95 / members.length).toFixed()
      })
    else
      $scope.team.memberContributions = []

    $scope.percentClass = (pct) ->
      return 'label-success'  if pct >= $scope.percentages.success
      return 'label-info'     if $scope.percentages.info    <= pct < $scope.percentages.success
      return 'label-warning'  if $scope.percentages.warning <= pct < $scope.percentages.info
      return 'label-danger'   if $scope.percentages.danger  <= pct < $scope.percentages.warning
)
