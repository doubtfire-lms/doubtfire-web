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
        next: (response)  -> alertService.success("Role changed")
        error: (response) -> alertService.danger(response)
      })

    $scope.changeMainConvenor = (staff) ->
      oldConvenor = $scope.unit.mainConvenor
      $scope.unit.mainConvenor = staff
      newUnitService.update($scope.unit).subscribe({
        next: (response) ->
          alertService.success("Main convenor changed")
        error: (response) ->
          $scope.unit.mainConvenor = oldConvenor
          alertService.danger(response)
      })

    $scope.addSelectedStaff = ->
      staff = $scope.selectedStaff
      $scope.selectedStaff = null
      $scope.unit.staff = [] unless $scope.unit.staff

      if staff.id?
        newUnitRoleService.create({ unit_id: $scope.unit.id, user_id: staff.id, role: 'Tutor' }, {cache: $scope.unit.staffCache}).subscribe({
          next:  (response) -> alertService.success("Staff member added")
          error: (response) -> alertService.danger(response)
        })
      else
        alertService.danger("Unable to add staff member. Ensure they have a tutor or convenor account in User admin first.")

    # Used in the typeahead to filter staff already in unit
    $scope.filterStaff = (staff) ->
      not _.find($scope.unit.staff, (listStaff) -> staff.id == listStaff.user.id)

    $scope.removeStaff = (staff) ->
      newUnitRoleService.delete(staff, {cache: $scope.unit.staffCache}).subscribe({
        next:  (response) -> alertService.success("Staff member removed")
        error: (response) -> alertService.danger(response)
      })

    $scope.groupSetName = (id) ->
      $scope.unit.groupSetsCache.get(id)?.name || "Individual Work"

)
