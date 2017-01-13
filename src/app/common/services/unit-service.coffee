angular.module("doubtfire.common.services.units", [])

.factory("unitService", (Unit, UnitRole, Students, Group, projectService, groupService, taskService, $filter, $rootScope, analyticsService, PortfolioSubmission, alertService, Project) ->
  #
  # The unit service object
  #
  unitService = {}

  unitService.loadedUnits = {}
  unitService.loadedUnitRoles = null

  $rootScope.$on 'signOut', ->
    unitService.loadedUnits = {}
    unitService.loadedUnitRoles = null

  unitService.getUnitRoles = (callback) ->
    fireCallback = ->
      callback(unitService.loadedUnitRoles) if _.isFunction(callback)
    unless unitService.loadedUnitRoles?
      UnitRole.query (roles) ->
        unitService.loadedUnitRoles = roles
        fireCallback()
    else
      fireCallback()

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
    unit.refresh = (refreshCallback) ->
      # get the unit...
      Unit.get({ id: unitId }, (new_unit) ->
        _.extend unit, new_unit

        # Map extra utility to tutorials
        unit.tutorials = _.map(unit.tutorials, (tutorial) ->
          tutorial.description = unitService.tutorialDescription(tutorial)
          tutorial
        )

        # Add a sequence from the order fetched from server
        unit.task_definitions = _.map(unit.task_definitions, (taskDef, index, list) ->
          taskDef.seq = index
          taskDef.group_set = _.find(unit.group_sets, {group_set_id: gs.id}) if taskDef.group_set_id
          taskDef.hasPlagiarismCheck = -> taskDef.plagiarism_checks.length > 0
          taskDef
        )

        # Refresh as needed
        unit.refreshStudents() if unit.loadStudents
        refreshCallback?(unit)
    )

    # Allow the caller to fetch a task definition from the unit based on its id
    unit.taskDef = (taskDef) ->
      unless _.isObject(taskDef) || _.isNumber(taskDef)
        throw Error "Task def must be a number or task definition object"
      taskDefId = if _.isObject(taskDef) then taskDef.task_definition_id else taskDef
      _.find unit.task_definitions, {id: taskDefId}

    unit.outcome = (outcomeId) ->
      _.find unit.ilos, {id: outcomeId}

    # Allow the caller to fetch a tutorial from the unit based on its id
    unit.tutorialFromId = (tuteId) ->
      _.find unit.tutorials, { id: +tuteId }

    # Extend unit to know task count
    unit.taskCount = -> unit.task_definitions.length

    # Returns all tutorials where the tutor id matches the user id provided
    unit.tutorialsForUserId = (userId) ->
      _.filter unit.tutorials, (tutorial) -> tutorial.tutor.id is userId

    unit.refreshStudents = ->
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
      unless unit.students?
        throw Error "Students not yet mapped to unit (unit.students is undefined)"
      _.find(unit.students, {project_id: id})

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

    unit.activeStudents = ->
      _.filter(unit.students, {enrolled: true})

    unit.extendStudent = (student) ->
      # test is already extended...
      if student.name?
        return student
      student.open = false
      # projects can find tasks using their task definition ids
      student.findTaskForDefinition = (taskDefId) ->
        _.find(student.tasks, {task_definition_id: taskDefId})
      student.unit = ->
        unit
      student.switchToLab = (tutorial) ->
        newId = tutorial?.id || -1
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

      student.activeTasks = ->
        _.filter student.tasks, (task) -> task.definition.target_grade <= student.target_grade

      student.tutorial = unit.tutorialFromId(student.tutorial_id)
      student.tutorName = ->
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

      student.progressSortOrder = ->
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

    # Return a group set given its ID
    unit.findGroupSet = (id) ->
      _.find(unit.group_sets, {id: +id})

    # Maps unit-related information to a group
    unit.mapGroupToUnit = (group) ->
      unitService.mapGroupToUnit(unit, group)

    # Queries the unit for all groups
    unit.getGroups = (groupSetId, onSuccess, onFailure) ->
      groupService.getGroups(unit, groupSetId, onSuccess, onFailure)

    # Adds a group to this unit
    unit.addGroup = (groupSetId, name, tutorialId, onSuccess, onFailure) ->
      groupService.addGroup(unit, groupSetId, name, tutorialId, onSuccess, onFailure)

    # Updates a group in this unit
    unit.updateGroup = (group, onSuccess, onFailure) ->
      if group.unit().id != unit.id
        throw Error "Cannot update group -- #{group.id} does not exist under unit #{unit.id}"
      groupService.updateGroup(group, onSuccess, onFailure)

    # Deletes a group in this unit
    unit.deleteGroup = (group, groupSet, onSuccess, onFailure) ->
      if group.unit().id != unit.id
        throw Error "Cannot delete group -- #{group.id} does not exist under unit #{unit.id}"
      groupService.deleteGroup(unit, group, groupSet, onSuccess, onFailure)

    # Returns if the unit has groupwork enabled
    unit.hasGroupwork = ->
      unit.group_sets?.length > 0

    #
    # Push all of the tasks downloaded into the existing student projects
    #
    unit.incorporateTasks = (tasks) ->
      _.map tasks, (t) ->
        project = unit.findStudent(t.project_id)
        if project?
          unless project.incorporateTask?
            projectService.mapTask t, unit, project
            projectService.addProjectMethods(project, unit)

          project.incorporateTask(t)

    #
    # Add any missing tasks and return the new collection
    #
    unit.fillWithUnStartedTasks = (tasks, taskDef) ->
      taskDef = unit.taskDef(taskDef)
      projs = _.filter(unit.students, (s) -> s.target_grade >= taskDef.target_grade)

      _.map projs, (p) ->
        t = _.find tasks, (t) -> t.project_id == p.project_id && t.task_definition_id == taskDef.id
        unless t?
          _.find p.tasks, (t) -> t.task_definition_id == taskDef.id
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

  #
  # Tutorial description
  #
  unitService.tutorialDescription = (tutorial) ->
    timeDesc = $filter('date')(tutorial.meeting_time, 'shortTime')
    "#{tutorial.meeting_day}s at #{timeDesc} by #{tutorial.tutor_name} in #{tutorial.meeting_location}"

  #
  # Adds additional unit-related functionality to groups
  #
  unitService.mapGroupToUnit = (unit, group) ->
    group.tutorial = -> unit.tutorialFromId(group.tutorial_id)
    group.unit = -> unit
    group

  unitService
)
