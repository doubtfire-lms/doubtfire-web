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
    # Shows the groupset selector
    showGroupSetSelector: '=?'
    # On change of a group
    onSelect: '=?'
  controller: ($scope, $filter, $timeout, alertService, Group, currentUser, listenerService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)

    # Unit role or project should be included in $scope
    if !$scope.unitRole? && !$scope.project? || $scope.unitRole? && $scope.project?
      throw Error "Group selector must have exactly one unit role or one project"

    # Filtering
    applyFilters = ->
      if $scope.unitRole? # apply staff filter
        filteredGroups = $filter('groupsInTutorials')($scope.selectedGroupSet.groups, $scope.unitRole, $scope.staffFilter)
      else # apply project filter
        filteredGroups = $filter('groupsForStudent')($scope.selectedGroupSet.groups, $scope.project, $scope.selectedGroupSet)
      # Apply remaining filters
      $scope.filteredGroups = $filter('paginateAndSort')(filteredGroups, $scope.pagination, $scope.tableSort)

    # Pagination values
    $scope.pagination =
      currentPage: 1
      maxSize: 10
      pageSize: 10
      totalSize: null
      show: false
      onChange: applyFilters

    # Initial sort orders
    $scope.tableSort =
      order: 'number'
      reverse: false

    # Table sorting
    $scope.sortTableBy = (column) ->
      $scope.tableSort.order = column
      $scope.tableSort.reverse = !$scope.tableSort.reverse
      applyFilters()

    # Loading
    startLoading  = -> $scope.loaded = false
    finishLoading = -> $timeout((-> $scope.loaded = true), 500)

    # Select group function
    $scope.selectGroup = (group) ->
      $scope.selectedGroup = group
      $scope.onSelect?(group)

    # Sets the placeholder text (useful to know named
    # groups are technically optional)
    resetNewGroupForm = () ->
      @newGroupForm?.reset()
      if _.isEmpty($scope.selectedGroupSet.groups)
        $scope.newGroupNamePlaceholder = "Group 1"
      else if _.last($scope.selectedGroupSet.groups)?.name.match(/\d+$/)?
        $scope.newGroupNamePlaceholder = "Group #{_.last($scope.selectedGroupSet.groups).number + 1}"
      else
        $scope.newGroupNamePlaceholder = "Enter New Group Name..."

    # Group set selector
    $scope.selectedGroupSet ?= _.first($scope.unit.group_sets)
    $scope.showGroupSetSelector ?= $scope.unit.group_sets.length > 1
    $scope.selectGroupSet = (groupSet) ->
      return unless groupSet?
      startLoading()
      $scope.selectGroup(null)
      $scope.unit.getGroups(groupSet.id, (groups) ->
        $scope.selectedGroupSet = groupSet
        groupSet.groups = groups
        finishLoading()
        resetNewGroupForm()
        applyFilters()
      , finishLoading)
    $scope.selectGroupSet($scope.selectedGroupSet)

    # Can only create groups if unitRole provided and selectedGroupSet
    $scope.canCreateGroups = $scope.unitRole? || $scope.selectedGroupSet?.allow_students_to_create_groups

    # Load groups if not loaded
    $scope.unit.getGroups($scope.selectedGroupSet.id) if $scope.selectedGroupSet?.groups?

    # Staff filter options (convenor should see all)
    $scope.staffFilter = {
      Convenor: 'all',
      Tutor: 'mine'
    }[$scope.unitRole.role]

    # Changing staff filter reapplies filter
    $scope.onChangeStaffFilter = applyFilters

    # Search text reapplies filter
    $scope.searchTextChanged = applyFilters

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
          resetNewGroupForm()
          applyFilters()
          $scope.selectedGroup = newGroup
      )

    # Update group function
    $scope.updateGroup = (data, groupId) ->
      group = _.find($scope.selectedGroupSet.groups, {id: groupId})
      group = _.extend(group, data)
      $scope.unit.updateGroup(group, applyFilters)

    # Remove group function
    $scope.deleteGroup = (group) ->
      $scope.unit.deleteGroup(group, $scope.selectedGroupSet,
        (success) ->
          $scope.selectedGroup = null if group.id == $scope.selectedGroup?.id
          resetNewGroupForm()
          applyFilters()
      )

    # Watch selected group set changes
    listeners.push $scope.$on 'UnitGroupSetEditor/SelectedGroupSetChanged', (evt, args) ->
      newGroupSet = $scope.unit.findGroupSet(args.id)
      return if newGroupSet == $scope.selectedGroupSet
      $scope.selectGroupSet(newGroupSet)
)
