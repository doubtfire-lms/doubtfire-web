angular.module("doubtfire.api.models.group-set", [])

.factory("GroupSet", (resourcePlus, DoubtfireConstants, fileDownloaderService) ->
  GroupSet = resourcePlus "/units/:unit_id/group_sets/:id", { id: "@id", unit_id: "@unit_id" }
  GroupSet.groupCSVUploadUrl = (unit, group_set) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/group_sets/#{group_set.id}/groups/csv.json"
  GroupSet.groupStudentCSVUploadUrl = (unit, group_set) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/group_sets/#{group_set.id}/groups/student_csv.json"
  GroupSet.downloadCSV = (unit, group_set) ->
    fileDownloaderService.downloadFile("#{DoubtfireConstants.API_URL}/units/#{unit.id}/group_sets/#{group_set.id}/groups/csv.json", "#{unit.code}-group-sets.csv")
  GroupSet.downloadStudentCSV = (unit, group_set) ->
    fileDownloaderService.downloadFile("#{DoubtfireConstants.API_URL}/units/#{unit.id}/group_sets/#{group_set.id}/groups/student_csv.json", "#{unit.code}-#{group_set.name}-students.csv")
  return GroupSet
)
