angular.module("doubtfire.common.services.group-service", [  ])
#
# Service for group-related functions
#
.factory("groupService", (Group, GroupMember, alertService) ->
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

  # Returns if the task provided is a group task
  groupService.isGroupTask = (task) ->
    task.definition.group_set?

  # Returns the group set name for the given group set ID and unit
  groupService.groupSetName = (id, unit) ->
    unit.findGroupSet(id)?.name || "Individual Work"

  # Maps additional functionality to a group
  groupService.mapFuncsToGroup = (group, unit, groupSet) ->
    group = unit.mapGroupToUnit(group)
    group.groupSet = -> groupSet
    group.addMember = (member, onSuccess, onFailure) ->
      groupService.addMemberToGroup(group, member, onSuccess, onFailure)
    group.removeMember = (member, onSuccess, onFailure) ->
      groupService.removeMemberFromGroup(group, member, onSuccess, onFailure)
    group.getMembers = (onSuccess, onFailure) ->
      groupService.getGroupMembersForGroup(group, onSuccess, onFailure)
    group.hasSpace = () ->
      return true if !groupSet.capacity?
      return group.student_count < groupSet.capacity + group.capacity_adjustment
    group

  # Queries a unit's groupset for the given ID, returning the groups for that group
  groupService.getGroups = (unit, groupSetId, onSuccess, onFailure) ->
    throw Error "No group set ID specified to unit.getGroups" unless groupSetId?
    groupSet = unit.findGroupSet(groupSetId)
    # return onSuccess?(groupSet.groups) if groupSet?.groups?
    Group.query({ unit_id: unit.id, group_set_id: groupSetId },
      (success) ->
        groupSet.groups = _.map(success, (group) ->
          groupService.mapFuncsToGroup(group, unit, groupSet)
        )
        onSuccess?(groupSet.groups)
      (failure) ->
        alertService.add("danger", failure.data?.error || "Unknown Error", 6000)
        onFailure?(failure)
    )

  # Adds an new group to the given groupset & unit
  groupService.addGroup = (unit, groupSet, name, tutorialId, onSuccess) ->
    unless unit? || groupSet?
      throw Error "Cannot create new group without unit, groupset or tutorialID"
    Group.create(
      {
        unit_id: unit.id,
        group_set_id: groupSet.id
        group: {
          name: name
          tutorial_id: tutorialId
        }
      }
      (success) ->
        newGroup = groupService.mapFuncsToGroup(success, unit, groupSet)
        groupSet.groups.push(newGroup)
        alertService.add("success", "#{newGroup.name} was created!", 3000)
        onSuccess?(newGroup)
      (failure) ->
        alertService.add("danger", failure.data?.error || "Unknown Error", 6000)
        onFailure?(failure)
    )

  # Updates the given group
  groupService.updateGroup = (group, onSuccess, onFailure) ->
    Group.update(
      {
        unit_id: group.unit().id,
        group_set_id: group.groupSet().id,
        id: group.id,
        group: {
          name: group.name,
          tutorial_id: group.tutorial_id,
          capacity_adjustment: group.capacity_adjustment
        }
      }
      (success) ->
        alertService.add("info", "#{group.name} was updated", 3000)
        onSuccess?(success)
      (failure) ->
        alertService.add("danger", failure.data?.error || "Unknown Error", 6000)
        onFailure?(failure)
    )

  # Deletes an entire group from the given groupset & unit
  groupService.deleteGroup = (unit, group, groupSet, onSuccess, onFailure) ->
    if group.group_set_id != groupSet.id
      throw Error "Cannot delete group -- group's group_set_id does not match groupSet specified"
    Group.delete(
      {
        unit_id: group.unit().id,
        group_set_id: group.groupSet().id,
        id: group.id,
        group: {
          name: group.name,
          tutorial_id: group.tutorial_id,
        }
      },
      (success) ->
        groupSet.groups = _.without(groupSet.groups, group)
        alertService.add("info", "#{group.name} was deleted", 3000)
        onSuccess?(unit.groups)
      (failure) ->
        alertService.add("danger", failure.data?.error || "Unknown Error", 3000)
        onFailure?(failure)
    )

  # Gets the group members for a specific group
  groupService.getGroupMembersForGroup = (group, onSuccess, onFailure) ->
    GroupMember.query(
      {
        unit_id: group.unit().id,
        group_set_id: group.groupSet().id,
        group_id: group.id
      }
      (success) ->
        group.members = success
        onSuccess?(group.members)
      (failure) ->
        onFailure?(group.members)
    )

  # Adds a group memeber to the currently selected group and groupset
  groupService.addMemberToGroup = (group, member, onSuccess, onFailure) ->
    if ! member?
      alertService.add('danger', "The student you are trying to add to the group could not be found.", 6000)
      return

    GroupMember.create(
      {
        unit_id: group.unit().id,
        group_set_id: group.groupSet().id,
        group_id: group.id
        project_id: member.project_id
      }
      (success) ->
        group.student_count += 1
        if member.groups?
          # Get old group..
          grp = member.groupForGroupSet(group.groupSet())
          if grp?
            grp.student_count -= 1
            # Remove current member from old group
            _.remove grp.members, (mbr) -> mbr.project_id == member.project_id
            _.remove member.groups, grp
          member.groups.push(group) # If member is actually a project!
        if group.members?
          # Has members so add this member
          group.members.push(success)
          alertService.add("info", "#{success.student_name} was added to '#{group.name}'", 3000)
          onSuccess?(group.members)
        else
          # Load all members of the group
          group.getMembers((->
            alertService.add("info", "#{success.student_name} was added to '#{group.name}'", 3000)
            onSuccess?()
          ), onFailure)
      (failure) ->
        alertService.add("danger", failure.data?.error || "Unknown Error", 6000)
        onFailure?(failure)
    )

  # Deletes a group memeber from their specific group
  groupService.removeMemberFromGroup = (group, member, onSuccess, onFailure) ->
    GroupMember.delete(
      {
        unit_id: group.unit().id,
        group_set_id: group.groupSet().id,
        group_id: group.id
        id: member.project_id # ID maps to student's project_id!
      }
      (success) ->
        group.student_count -= 1
        # Loaded group members?
        if group.members?
          _.remove group.members, member
          _.remove member.groups, group
          alertService.add("info", "#{member.student_name} was removed from '#{group.name}'", 3000)
          onSuccess?(group.members)
        else
          group.getMembers((->
            alertService.add("info", "#{member.student_name} was removed from '#{group.name}'", 3000)
            onSuccess?()
          ), onFailure)
      (failure) ->
        alertService.add("danger", failure.data?.error || "Unknown Error", 6000)
        onFailure?(failure)
    )

  groupService
)
