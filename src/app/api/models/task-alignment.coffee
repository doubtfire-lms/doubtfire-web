angular.module("doubtfire.api.models.task-alignment", [])

.factory("TaskAlignment", (resourcePlus, DoubtfireConstants, currentUser, $window) ->
  TaskAlignment = {}
  TaskAlignment.taskAlignmentCSVUploadUrl = (unit, project_id) ->
    if project_id?
      "#{DoubtfireConstants.API_URL}/units/#{unit.id}/learning_alignments/csv.json?project_id=#{project_id}&auth_token=#{currentUser.authenticationToken}"
    else
      "#{DoubtfireConstants.API_URL}/units/#{unit.id}/learning_alignments/csv.json?auth_token=#{currentUser.authenticationToken}"

  TaskAlignment.downloadCSV = (unit, project_id) ->
    if project_id?
      $window.open "#{DoubtfireConstants.API_URL}/units/#{unit.id}/learning_alignments/csv.json?project_id=#{project_id}&auth_token=#{currentUser.authenticationToken}", "_blank"
    else
      $window.open "#{DoubtfireConstants.API_URL}/units/#{unit.id}/learning_alignments/csv.json?auth_token=#{currentUser.authenticationToken}", "_blank"
  return TaskAlignment
)
