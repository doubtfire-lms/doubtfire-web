angular.module("doubtfire.services.projects", [])

.factory("projectService", ($filter, taskService, Project) ->
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
  projectService.updateTaskStats = (project, new_stats_str) ->
    new_stats = project.task_stats
    for i, value of new_stats_str.split("|")
      if i < project.task_stats.length
        new_stats[i].value = Math.round(100 * value)
      else
        project.progress_stats[i - project.task_stats.length].value = Math.round(100 * value)
    project.progress_sort = 0
    for i, stat of project.progress_stats
      project.progress_sort = Math.round(project.progress_sort + stat.value * 1000000 / (Math.pow(100, i)))

    project.task_stats = new_stats

  projectService.mapTask = ( task, unit, project ) ->
    td = unit.taskDef(task.task_definition_id)
    task.definition = td
    # must be function to avoid cyclic structure
    task.project = () -> project
    task.status_txt = () -> taskService.statusLabels[task.status]
    task.statusSeq = () -> taskService.statusSeq[task.status]
    task.updateTaskStatus = (project, new_stats) ->
      projectService.updateTaskStats(project, new_stats)
    task

  projectService.addTaskDetailsToProject = (project, unit) ->
    if (! project.tasks?) || project.tasks.length < unit.task_definitions.length
      base = unit.task_definitions.map (td) -> {
        id: null
        status: "not_started"
        task_definition_id: td.id
        processing_pdf: false
        has_pdf: false
        include_in_portfolio: true
        pct_similar: 0
        similar_to_count: 0
        times_assessed: 0
      }

      project.tasks = _.extend base, project.tasks

    project.tasks = project.tasks.map (task) ->
      projectService.mapTask task, unit, project
    project.tasks = _.sortBy(project.tasks, (t) -> t.definition.abbreviation).reverse()
    project

  projectService.addProjectMethods = (project, unit) ->
    project.updateBurndownChart = () ->
      Project.get { id: project.project_id }, (response) ->
        project.burndown_chart_data = response.burndown_chart_data

    project.incorporateTask = (newTask) ->
      if ! project.tasks?
        project.tasks = []

      currentTask = _.find project.tasks, (t) -> t.task_definition_id == newTask.task_definition_id

      if currentTask?
        currentTask = _.extend currentTask, newTask
      else
        project.tasks.push projectService.mapTask(newTask, unit, project)
        currentTask = newTask

      currentTask

    project.refresh = (unit_obj) ->
      Project.get { id: project.project_id }, (response) ->
        _.extend project, response
        if unit_obj
          projectService.addTaskDetailsToProject(project, unit_obj)

  projectService.fetchDetailsForProject = (project, unit, callback) ->
    if project.burndown_chart_data?
      callback(project)
    else
      Project.get { id: project.project_id }, (project_response) ->
        _.extend project, project_response

        projectService.addProjectMethods(project, unit)

        if unit
          projectService.addTaskDetailsToProject(project, unit)
        callback(project)

  projectService.updateGroups = (project) ->
    if project.groups?
      Project.get { id: project.project_id }, (response) ->
        project.groups = response.groups

  projectService.getGroupForTask = (project, task) ->
    return null if not task.definition.group_set

    _.find project.groups, (grp) -> grp.group_set_id == task.definition.group_set.id

  projectService.taskFromTaskDefId = (project, task_definition_id) ->
    _.find project.tasks, (task) -> task.task_definition_id == task_definition_id

  projectService.tasksInTargetGrade = (project) ->
    $filter('byGrade')(project.tasks, project.target_grade)

  projectService.tasksByStatus = (project, statusKey) ->
    tasksToConsider = projectService.tasksInTargetGrade(project)
    _.where(tasksToConsider, {status: statusKey})

  projectService
)
