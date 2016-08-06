_ = require('lodash')

mod = angular.module("doubtfire.common.services.units", [])

.factory("unitService", (Unit, UnitRole, Students, Group, projectService, taskService, $rootScope, analyticsService, PortfolioSubmission, alertService, Project) ->
  #
  # The unit service object
  #
  unitService = {}

  unitService.loadedUnits = {}
  unitService.loadedUnitRoles = null

  $rootScope.$on 'signOut', () ->
    unitService.loadedUnits = {}
    unitService.loadedUnitRoles = null

  unitService.getUnitRoles = ( callback ) ->
    unless unitService.loadedUnitRoles?
      unitService.loadedUnitRoles = []
      UnitRole.query(
        (roles) ->
          Array.prototype.push.apply unitService.loadedUnitRoles, roles
        )

    if _.isFunction(callback)
      callback(unitService.loadedUnitRoles)

    unitService.loadedUnitRoles

  unitService.getUnit = (unitId, loadStudents, allStudents, callback) ->
    result = unitService.loadedUnits[unitId]
    if result
      callback(result)
      return

    unit = {
      allStudents: allStudents
      loadStudents: loadStudents
      analytics: {}
    }

    #
    # Refresh the unit with data from the server...
    #
    unit.refresh = (refresh_callback) ->
      # get the unit...
      Unit.get { id: unitId }, (new_unit) ->
        _.extend unit, new_unit

        # Add a sequence from the order fetched from server
        _.each(unit.task_definitions, (td, index, list) ->
          td.seq = index
          if td.group_set_id
            td.group_set = _.find(unit.group_sets, (gs) -> td.group_set_id == gs.id)
          td.hasPlagiarismCheck = () -> td.plagiarism_checks.length > 0
        )

        if unit.loadStudents
          unit.refreshStudents()

        if refresh_callback?
          refresh_callback(unit)

    # Allow the caller to fetch a task definition from the unit based on its id
    unit.taskDef = (taskDef) ->
      if typeof taskDef isnt 'number'
        taskDef = taskDef.task_definition_id
      result = _.find unit.task_definitions, {id: taskDef}

    unit.outcome = (outcomeId) ->
      result = _.find unit.ilos, {id: outcomeId}

    # Allow the caller to fetch a tutorial from the unit based on its id
    unit.tutorialFromId = (tuteId) ->
      _.find unit.tutorials, { id: +tuteId }

    # Extend unit to know task count
    unit.taskCount = () -> unit.task_definitions.length

    unit.refreshStudents = () ->
      # Fetch the students for the unit
      Students.query { unit_id: unit.id, all: unit.allStudents }, (students) ->
        # extend the students with their tutorial data
        new_students = students.map (student) ->
          unit.extendStudent(student)
          student

        unit.students = new_students

    unit.studentEnrolled = (id) ->
      student = unit.findStudent id
      student?.enrolled

    unit.findStudent = (id) ->
      _.find unit.students, (s) -> s.project_id == id

    unit.addStudent = (student) ->
      analyticsService.event 'Unit Service', 'Added Student'
      foundStudent = unit.findStudent student.project_id
      studentExists = foundStudent?
      unless studentExists
        # student doesn't exist - push it to the student list
        unit.students.push student
      else
        # student exists - extend the student
        student = _.extend foundStudent, student
      unit.extendStudent student

    unit.active_students = () ->
      _.filter unit.students, (student) -> student.enrolled

    unit.extendStudent = (student) ->
      # test is already extended...
      if student.name?
        return student

      student.open = false

      # projects can find tasks using their task definition ids
      student.findTaskForDefinition = (taskDefId) ->
        _.find student.tasks, (task) -> task.task_definition_id == taskDefId

      student.unit = () ->
        unit

      student.switchToLab = (tutorial) ->
        if tutorial
          newId = tutorial.id
        else
          newId = -1

        analyticsService.event 'Teacher View - Students Tab', 'Changed Student Tutorial'
        Project.update({ id: student.project_id, tutorial_id: newId },
          (project) ->
            student.tutorial_id = project.tutorial_id
            student.tutorial = student.unit().tutorialFromId( student.tutorial_id )
          (response) ->
            alertService.add "danger", "Failed to change tutorial. #{response?.data?.error}", 8000
        )

      #TODO: change these to use functions...
      student.name = student.first_name + " " + student.last_name
      if student.has_portfolio
        student.portfolio_status = 1
      else if student.compile_portfolio
        student.portfolio_status = 0.5
      else
        student.portfolio_status = 0

      student.activeTasks = () ->
        _.filter student.tasks, (task) -> task.definition.target_grade <= student.target_grade

      student.tutorial = unit.tutorialFromId( student.tutorial_id )
      student.tutorName = () ->
        if student.tutorial?
          student.tutorial.tutor_name
        else
          ''
      student.task_stats = [
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[10]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[0]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[1]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[2]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[3]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[4]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[5]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[6]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[7]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[8]))}
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[9]))}
      ]

      student.taskStatValue = (key) ->
        student.task_stats[projectService.taskStatIndex[key]].value

      student.progressSortOrder = () ->
        20 * student.taskStatValue('complete') +
        15 * (student.taskStatValue('discuss') + student.taskStatValue('demonstrate')) +
        10 * (student.taskStatValue('ready_to_mark')) +
        5 * (student.taskStatValue('fix_and_resubmit')) +
        2 * (student.taskStatValue('working_on_it')) +
        1 * (student.taskStatValue('need_help'))


      student.portfolioUrl = ->
        PortfolioSubmission.getPortfolioUrl(student)

      student.assignGrade = (score, rationale) ->
        Project.update { id: student.project_id, grade: score, old_grade:student.grade, grade_rationale: rationale },
          (project) ->
            student.grade = project.grade
            student.grade_rationale = project.grade_rationale
            alertService.add("success", "Grade updated.", 2000)
          (response) ->
            alertService.add("danger", "Grade was not updated: #{response.data.error}", 8000)

      projectService.updateTaskStats(student, student.stats)
      projectService.addTaskDetailsToProject(student, unit)

    unit.getGroups = (group_set, group_callback) ->
      return unless group_set
      Group.query { unit_id: unit.id, group_set_id: group_set.id }, (groups) ->
        if group_callback?
          group_callback(groups)

    unit.hasGroupwork = () ->
      unit.group_sets? && unit.group_sets.length > 0

    #
    # Push all of the tasks downloaded into the existing student projects
    #
    unit.incorporateTasks = (tasks) ->
      _.map tasks, (t) ->
        project = unit.findStudent(t.project_id)
        if project?
          if ! project.incorporateTask?
            projectService.mapTask t, unit, project
            projectService.addProjectMethods(project, unit)

          project.incorporateTask(t)

    #
    # Add any missing tasks and return the new collection
    #
    unit.fillWithUnStartedTasks = (tasks, task_def) ->
      projs = _.filter(unit.students, (s) -> s.target_grade >= task_def.target_grade)

      _.map projs, (p) ->
        t = _.find tasks, (t) -> t.project_id == p.project_id && t.task_definition_id == task_def.id
        if ! t?
          _.find p.tasks, (t) -> t.task_definition_id == task_def.id
        else
          t

    unit.refresh(callback)
    unit
  # end get unit

  #
  # provide typeahead data for a unit
  #
  unitService.unitTypeAheadData = (unit) ->
    result = []
    angular.forEach(unit.tutorials, (tute) ->
      result.push(tute.abbreviation)
      result.push(tute.tutor_name)
    )
    angular.forEach(unit.students, (student) ->
      result.push(student.name)
      result.push(student.student_id)
    )
    result = _.uniq(result, (item) -> item )
    result

  unitService
)

module.exports = mod.name
