angular.module("doubtfire.api.models.task-alignment", [])

.factory("TaskAlignment", (resourcePlus, DoubtfireConstants, $window, fileDownloaderService) ->
  TaskAlignment = {}
  TaskAlignment.taskAlignmentCSVUploadUrl = (unit, project_id) ->
    if project_id?
      "#{DoubtfireConstants.API_URL}/units/#{unit.id}/learning_alignments/csv.json?project_id=#{project_id}"
    else
      "#{DoubtfireConstants.API_URL}/units/#{unit.id}/learning_alignments/csv.json"

  TaskAlignment.downloadCSV = (unit, project_id) ->
    if project_id?
      fileDownloaderService.downloadFile("#{DoubtfireConstants.API_URL}/units/#{unit.id}/learning_alignments/csv.json?project_id=#{project_id}", "#{project.student.name}-alignments.csv")
    else
      fileDownloaderService.downloadFile("#{DoubtfireConstants.API_URL}/units/#{unit.id}/learning_alignments/csv.json", "#{unit.code}-alignments.csv")
  return TaskAlignment
)
