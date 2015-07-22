angular.module('doubtfire.groups.partials.group-selector-directive', [])

.directive('groupSelector', ->
  replace: true
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
          grpName = null
        (response) -> alertService.add("danger", response.data.error, 6000)
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
      _.find($scope.unit.tutorials, (t) -> t.id == id)

    $scope.$watch 'selectedGroupset', (newValue, oldValue) ->
      $scope.unit.getGroups newValue, (groups) ->
        $scope.groups = groups
)