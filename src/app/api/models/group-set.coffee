angular.module("doubtfire.api.models.group-set", [])

.factory("GroupSet", (resourcePlus, DoubtfireConstants, currentUser, $window) ->
  GroupSet = resourcePlus "/units/:unit_id/group_sets/:id", { id: "@id", unit_id: "@unit_id" }
  GroupSet.groupCSVUploadUrl = (unit, group_set) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/group_sets/#{group_set.id}/groups/csv.json?auth_token=#{currentUser.authenticationToken}"
  GroupSet.groupStudentCSVUploadUrl = (unit, group_set) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/group_sets/#{group_set.id}/groups/student_csv.json?auth_token=#{currentUser.authenticationToken}"
  GroupSet.downloadCSV = (unit, group_set) ->
    $window.open "#{DoubtfireConstants.API_URL}/units/#{unit.id}/group_sets/#{group_set.id}/groups/csv.json?auth_token=#{currentUser.authenticationToken}", "_blank"
  GroupSet.downloadStudentCSV = (unit, group_set) ->
    $window.open "#{DoubtfireConstants.API_URL}/units/#{unit.id}/group_sets/#{group_set.id}/groups/student_csv.json?auth_token=#{currentUser.authenticationToken}", "_blank"
  return GroupSet
)
