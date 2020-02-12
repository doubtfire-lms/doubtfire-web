angular.module('doubtfire.units.states.edit.directives.unit-staff-editor', [])

#
# Editor for adding new staff to a unit and assigning those staff
# members new unit roles within the unit
#
.directive('unitStaffEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-staff-editor/unit-staff-editor.tpl.html'
  controller: ($scope, $rootScope, Unit, UnitRole, alertService, groupService) ->
    temp = []
    users = []

    $scope.changeRole = (unitRole, role_id) ->
      unitRole.role_id = role_id
      unitRole.unit_id = $scope.unit.id
      UnitRole.update { id: unitRole.id, unit_role: unitRole },
        (response) -> alertService.add("success", "Role changed", 2000)
        (response) ->
          alertService.add("danger", response.data.error, 6000)

    $scope.changeMainConvenor = (staff) ->
      Unit.update {id: $scope.unit.id, unit: {main_convenor_id: staff.id}},
        (response) ->
          alertService.add("success", "Main convenor changed", 2000)
          $scope.unit.main_convenor_id = staff.id
        (response) ->
          alertService.add("danger", response.data.error, 6000)

    $scope.addSelectedStaff = ->
      staff = $scope.selectedStaff
      $scope.selectedStaff = null
      $scope.unit.staff = [] unless $scope.unit.staff

      if staff.id?
        tutorRole = UnitRole.create { unit_id: $scope.unit.id, user_id: staff.id, role: 'Tutor' },
          (response) -> $scope.unit.staff.push(tutorRole)
          (response) ->
            alertService.add('danger', "Unable to add staff member. #{response.data.error}", 6000)
      else
        alertService.add('danger', "Unable to add staff member. Ensure they have a tutor or convenor account in User admin first.", 6000)

    $scope.findStaffUser = (id) ->
      for staff in $scope.staff
        return staff if staff.id == id

    # Used in the typeahead to filter staff already in unit
    $scope.filterStaff = (staff) ->
      not _.find($scope.unit.staff, (listStaff) -> staff.id == listStaff.user_id)

    $scope.removeStaff = (staff) ->
      $scope.unit.staff = _.without $scope.unit.staff, staff
      UnitRole.delete { id: staff.id }
      staffUser = $scope.findStaffUser(staff.user_id)

    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit)

)
