#
# Dropdown listing all units studied
#
angular.module('doubtfire.common.header.unit-dropdown', [])
.directive 'unitDropdown', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/header/unit-dropdown/unit-dropdown.tpl.html'
  controller: ($scope, unitService, projectService, dateService) ->
    $scope.showDate = dateService.showDate
    $scope.isUniqueUnitRole = (unit) ->
      units = _.filter $scope.unitRoles, { unit_id: unit.unit_id }
      # teaching userRoles will default to tutor role if both convenor and tutor
      units.length == 1 || unit.role == "Tutor"

    # Global Units Menu
    unitService.getUnitRoles (roles) ->
      $scope.unitRoles = roles
    projectService.getProjects false, (projects) ->
      $scope.projects = projects
