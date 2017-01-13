angular.module('doubtfire.groups.group-selector', [])

#
# Allows tutors and students to select (and create if applicable)
# new groups for teamwork
#
.directive('groupSelector', ->
  restrict: 'E'
  templateUrl: 'groups/group-selector/group-selector.tpl.html'
  scope:
    unit: "="
    # Use project for student context
    project: "=?"
    # Use unit role for tutor context
    unitRole: "=?"
    # Pass in a groupset to set the groupset context
    selectedGroupSet: '='
    # Bind the selected group for switching
    selectedGroup: '=?'
    # Callback for group change
    onSelectedGroupChange: '=?'
    # Callback for group set change
    onSelectedGroupSetChange: '=?'
  controller: ($scope, alertService, Group, currentUser) ->
    # Unit role or project should be included in $scope
    if !$scope.unitRole? && !$scope.project? || $scope.unitRole? && $scope.project?
      throw Error "Group selector must have exactly one unit role or one project"

    # Pagination details
    $scope.pagination =
      currentPage: 1
      maxSize: 10
      pageSize: 10

    # Group set selector
    $scope.selectedGroupSet = _.first($scope.unit.group_sets)
    $scope.unit.getGroups($scope.selectedGroupSet.id)
    $scope.showGroupSetSelector = $scope.unit.group_sets.length > 1
    $scope.selectGroupSet = (groupSet) ->
      $scope.unit.getGroups(groupSet.id)
      $scope.onSelectedGroupSetChange(groupSet)

    # Can only create groups if unitRole provided and selectedGroupSet
    $scope.canCreateGroups = $scope.unitRole? || $scope.selectedGroupSet?.allow_students_to_create_groups

    # Initial sort orders
    $scope.groupSortOrder = 'name'

    # Load groups if not loaded
    $scope.unit.getGroups($scope.selectedGroupSet.id) if $scope.selectedGroupSet?.groups?

    # Staff filter options (convenor should see all)
    $scope.staffFilter = {
      Convenor: 'all',
      Tutor: 'mine'
    }[$scope.unitRole.role]

    # Sets the placeholder text (useful to know named
    # groups are technically optional)
    resetAddGroup = () ->
      if _.isEmpty($scope.groups)
        $scope.newGroupNamePlaceholder = "Group 0"
      else if _.last($scope.groups)?.name.match(/\d+$/)?
        $scope.newGroupNamePlaceholder = "Group #{$scope.groups.length}"
      else
        $scope.newGroupNamePlaceholder = "Enter New Group Name..."
      $scope.newGroupName = null
    resetAddGroup()

    # Adds a group to the unit
    $scope.addGroup = (name) ->
      if $scope.unit.tutorials.length == 0
        alertService.add("danger", "Please ensure there is at least one tutorial before groups are created", 6000)
      # Student context
      if $scope.project
        tutorialId = $scope.project.tutorial.id
      # Convenor or Tutor
      else
        tutorName = $scope.unitRole?.name || currentUser.profile.name
        tutorialId = _.find($scope.unit.tutorials, {tutor_name: tutorName})?.id
        # Default to first tutorial if can't find
        tutorialId ?= _.first($scope.unit.tutorials).id
      $scope.unit.addGroup($scope.selectedGroupSet, name, tutorialId,
        (newGroup) ->
          resetAddGroup()
          $scope.selectedGroup = newGroup
      )

    # Update group function
    $scope.updateGroup = $scope.unit.updateGroup

    # Remove group function
    $scope.removeGroup = (group) ->
      $scope.unit.removeGroup(group,
        (success) ->
          $scope.selectedGroup = null if group.id == $scope.selectedGroup.id
      )

    # Select group function
    $scope.selectGroup = (group) ->
      $scope.selectedGroup = group
      $scope.onSelectedGroupChange?(group)
)
