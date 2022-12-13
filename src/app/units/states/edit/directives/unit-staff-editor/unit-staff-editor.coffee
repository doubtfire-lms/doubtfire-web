angular.module('doubtfire.units.states.edit.directives.unit-staff-editor', [])

#
# Editor for adding new staff to a unit and assigning those staff
# members new unit roles within the unit
#
.directive('unitStaffEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-staff-editor/unit-staff-editor.tpl.html'
  controller: ($scope, $rootScope, alertService, newUnitService, newUnitRoleService) ->
    temp = []
    users = []

    $scope.unit.staffCache.values.subscribe( (staff) -> $scope.unitStaff = staff )

    $scope.changeRole = (unitRole, role_id) ->
      unitRole.roleId = role_id
      newUnitRoleService.update(unitRole).subscribe({
        next: (response)  -> alertService.add("success", "Role changed", 2000)
        error: (response) -> alertService.add("danger", response, 6000)
      })

    $scope.changeMainConvenor = (staff) ->
      oldConvenor = $scope.unit.mainConvenor
      $scope.unit.mainConvenor = staff
      newUnitService.update($scope.unit).subscribe({
        next: (response) ->
          alertService.add("success", "Main convenor changed", 2000)
        error: (response) ->
          $scope.unit.mainConvenor = oldConvenor
          alertService.add("danger", response, 6000)
      })

    $scope.addSelectedStaff = ->
      staff = $scope.selectedStaff
      $scope.selectedStaff = null
      $scope.unit.staff = [] unless $scope.unit.staff

      if staff.id?
        newUnitRoleService.create({ unit_id: $scope.unit.id, user_id: staff.id, role: 'Tutor' }, {cache: $scope.unit.staffCache}).subscribe({
          next:  (response) -> alertService.add('success', "Staff member added", 2000)
          error: (response) -> alertService.add('danger', response, 6000)
        })
      else
        alertService.add('danger', "Unable to add staff member. Ensure they have a tutor or convenor account in User admin first.", 6000)

    # Used in the typeahead to filter staff already in unit
    $scope.filterStaff = (staff) ->
      not _.find($scope.unit.staff, (listStaff) -> staff.id == listStaff.user.id)

    $scope.removeStaff = (staff) ->
      newUnitRoleService.delete(staff, {cache: $scope.unit.staffCache}).subscribe({
        next:  (response) -> alertService.add('success', "Staff member removed", 2000)
        error: (response) -> alertService.add('danger', response, 6000)
      })

    $scope.groupSetName = (id) ->
      $scope.unit.groupSetsCache.get(id)?.name || "Individual Work"

)
