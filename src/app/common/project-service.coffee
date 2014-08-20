angular.module("doubtfire.project-service", [ "doubtfire.task-service" ])

.factory("projectService", (taskService) ->
  #
  # The unit service object
  #
  projectService = {}

  projectService.progressKeys = [
    'on_time',
    'one_week_late',
    'two_weeks_late',
    'not_started'
  ]

  #
  # projects's can update their task stats
  # converts the | delimited stats to its component arrays
  #
  projectService.updateTaskStats = (student, new_stats_str) ->
    for i, value of new_stats_str.split("|")
      if i < student.task_stats.length
        student.task_stats[i].value = Math.round(100 * value)
      else
        student.progress_stats[i - student.task_stats.length].value = Math.round(100 * value)
    student.progress_sort = 0
    for i, stat of student.progress_stats
      student.progress_sort = Math.round(student.progress_sort + stat.value * 1000000 / (Math.pow(100, i)))
  projectService
)