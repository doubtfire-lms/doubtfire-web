angular.module('doubtfire.groups.partials.group-selector-directive', [])

.directive('groupSelector', ->
  restrict: 'E'
  templateUrl: 'groups/partials/templates/group-selector.tpl.html'

  controller: ($scope, alertService, Group) ->
    # pagination of groups
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 5

    # initial sort orders
    $scope.groupSortOrder = 'name'

    $scope.addGroup = (name) ->
      if $scope.unit.tutorials.length == 0
        alertService.add("danger", "Please ensure there is at least one tutorial before groups are created", 6000)
      if $scope.project #in a student context
        tutorial_id = $scope.project.tutorial.id
      else #convenor/tutor
        tutorial_id = _.find $scope.unit.tutorials, (tutorial) -> tutorial.tutor_name == $scope.assessingUnitRole.name
        if not tutorial_id
          tutorial_id = $scope.unit.tutorials[0].id
          $scope.staffFilter = 'all'
        else
          tutorial_id = tutorial_id.id

      Group.create(
        {
          unit_id: $scope.unit.id,
          group_set_id: $scope.selectedGroupset.id
          group:
            {
              name: name
              tutorial_id: tutorial_id
            }
        },
        (grp) ->
          $scope.groups.push(grp)
          $scope.selectGroup(grp) if $scope.selectedGroup is null
          alertService.add("success", "#{grp.name} was created!", 3000)

          addGroupForm.reset()
        (response) -> alertService.add("danger", response.data.error, 6000)
      )

    $scope.saveGroup = (grp, id) ->
      Group.update(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          id: id,
          group: {
            name: grp.name,
            tutorial_id: grp.tutorial_id,
          }
        }, (response) ->
          alertService.add("info", "#{grp.name} was updated", 3000)
        (response) -> alertService.add("danger", response.data.error, 6000)
      )

    $scope.removeGroup = (grp) ->
      $scope.selectGroup(null) if grp is $scope.selectedGroup
      Group.delete(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          id: grp.id
        },
          (response) ->
            $scope.groups = _.filter($scope.groups, (grp1) -> grp.id != grp1.id )
            alertService.add("info", "#{grp.name} was deleted", 3000)
          (response) ->
            alertService.add("danger", response.data.error, 3000)
        )

    $scope.selectGroup = (grp) ->
      if grp
        $scope.selectedGroup = grp
      else
        $scope.selectedGroup = null

      if $scope.onSelectGroup
        $scope.onSelectGroup(grp)

      $scope.$digest #notify

    if $scope.selectedGroupset
      $scope.unit.getGroups $scope.selectedGroupset, (groups) ->
        $scope.groups = groups

    $scope.selectTutorial = (id) ->
      _.find($scope.unit.tutorials, (t) -> t.id is id)

    $scope.$watch 'selectedGroupset', (newValue, oldValue) ->
      $scope.unit.getGroups newValue, (groups) ->
        $scope.groups = groups
)