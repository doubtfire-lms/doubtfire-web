angular.module("doubtfire.services.units", [])

.factory("unitService", (Unit, Students, Group, projectService, taskService) ->
  #
  # The unit service object
  #
  unitService = {}

  unitService.loadedUnits = {}

  unitService.getUnit = (unitId, loadStudents, allStudents, callback) ->
    result = unitService.loadedUnits[unitId]
    if result
      callback(result)
      return

    unit = {
      allStudents: allStudents
      loadStudents: loadStudents
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
        )

        if unit.loadStudents
          unit.refreshStudents()

        if refresh_callback?
          refresh_callback(unit)

    # Allow the caller to fetch a task definition from the unit based on its id
    unit.taskDef = (taskDefId) ->
      result = _.where unit.task_definitions, {id: taskDefId}
      if result
        result[0]

    # Allow the caller to fetch a tutorial from the unit based on its id
    unit.tutorialFromId = (tuteId) ->
      _.find unit.tutorials, { id: tuteId }

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

    unit.findStudent = (id) ->
      _.find unit.students, (s) -> s.project_id == id

    unit.addStudent = (student) ->
      unit.extendStudent(student)
      unit.students.push(student)

    unit.extendStudent = (student) ->
      # test is already extended...
      if student.name?
        return
      student.open = false
      student.name = student.first_name + " " + student.last_name
      if student.has_portfolio
        student.portfolio_status = 1
      else if student.compile_portfolio
        student.portfolio_status = 0.5
      else
        student.portfolio_status = 0

      student.tutorial = unit.tutorialFromId( student.tute )
      student.task_stats = [
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[0]))},
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[1]))},
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[2]))},
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[3]))},
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[4]))},
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[5]))},
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[6]))},
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[7]))},
        { value: 0, type: _.trim(_.dasherize(taskService.statusKeys[8]))}
      ]
      student.progress_stats = [
        # Progress stats
        { value: 0, type: _.trim(_.dasherize(projectService.progressKeys[0]))},
        { value: 0, type: _.trim(_.dasherize(projectService.progressKeys[1]))},
        { value: 0, type: _.trim(_.dasherize(projectService.progressKeys[2]))},
        { value: 0, type: _.trim(_.dasherize(projectService.progressKeys[3]))},
      ]
      projectService.updateTaskStats(student, student.stats)
      projectService.addTaskDetailsToProject(student, unit)

    unit.getGroups = (group_set, group_callback) ->
      return unless group_set
      Group.query { unit_id: unit.id, group_set_id: group_set.id }, (groups) ->
        if group_callback?
          group_callback(groups)

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