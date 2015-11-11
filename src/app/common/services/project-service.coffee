angular.module("doubtfire.services.projects", [])

.factory("projectService", (taskService, Project) ->
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

  ###
  projects's can update their task stats
  converts the | delimited stats to its component arrays
  @param  student [Student|Project] The student's stats to update
  ###
  projectService.updateTaskStats = (student, new_stats_str) ->
    new_stats = student.task_stats
    for i, value of new_stats_str.split("|")
      if i < student.task_stats.length
        new_stats[i].value = Math.round(100 * value)
      else
        student.progress_stats[i - student.task_stats.length].value = Math.round(100 * value)
    student.progress_sort = 0
    for i, stat of student.progress_stats
      student.progress_sort = Math.round(student.progress_sort + stat.value * 1000000 / (Math.pow(100, i)))

    student.task_stats = new_stats

  projectService.addTaskDetailsToProject = (student, unit) ->
    return if ! student.tasks?
    student.tasks = student.tasks.map (task) ->
      td = unit.taskDef(task.task_definition_id)
      task.definition = td
      task.status_txt = taskService.statusLabels[task.status]
      task.updateTaskStatus = (project, new_stats) ->
        projectService.updateTaskStats(project, new_stats)
      task
    student.tasks = _.sortBy(student.tasks, (t) -> t.definition.abbreviation).reverse()
    student

  projectService.fetchDetailsForProject = (student, unit, callback) ->
    if student.tasks
      callback(student)
    else
      Project.get { id: student.project_id }, (project) ->
        _.extend student, project
        if unit
          projectService.addTaskDetailsToProject(student, unit)
        callback(student)

  projectService.updateGroups = (project) ->
    if project.groups?
      Project.get { id: project.project_id }, (response) ->
        project.groups = response.groups

  projectService.getGroupForTask = (project, task) ->
    return null if not task.definition.group_set

    _.find project.groups, (grp) -> grp.group_set_id == task.definition.group_set.id

  projectService.taskFromTaskDefId = (project, task_definition_id) ->
    _.find project.tasks, (task) -> task.task_definition_id == task_definition_id

  projectService
)