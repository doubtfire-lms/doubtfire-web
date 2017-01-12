angular.module("doubtfire.common.services.group-service", [  ])
#
# Service for group-related functions
#
.factory("groupService", ->
  #
  # The unit service object
  #
  groupService = {}

  # gets the sum of contributions assuming that member has value rather than their current rating
  groupService.groupContributionSum = (members, member, value) ->
    _.reduce members,
      (memo, mbr) ->
        if member == mbr
          memo + value
        else
          memo + mbr.rating
      0

  groupService.isGroupTask = (task) ->
    task.definition.group_set?

  groupService.groupSetName = (id, unit) ->
    _.find(unit.group_sets, {id: +id})?.name || "Individual Work"

  groupService
)
