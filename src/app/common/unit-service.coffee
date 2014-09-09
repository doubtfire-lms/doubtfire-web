angular.module("doubtfire.unit-service", [ 'doubtfire.api' ])

.factory("unitService", (Unit, Students, projectService, taskService) ->
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

    # Get the unit data
    Unit.get { id: unitId }, (unit) ->
      # Add a sequence from the order fetched from server
      _.each(unit.task_definitions, (td, index, list) ->
        td.seq = index
      )
      # Allow the caller to fetch a task definition from the unit based on its id
      unit.taskDef = (taskDefId) ->
        result = _.where unit.task_definitions, {id: taskDefId}
        if result
          result[0]

      # Allow the caller to fetch a tutorial from the unit based on its id
      unit.tutorialFromId = (tuteId) ->
        _.where unit.tutorials, { id: tuteId }

      # Extend unit to know task count
      unit.taskCount = () -> unit.task_definitions.length

      unit.addStudent = (student) ->
        unit.extendStudent(student)
        unit.students.push(student)

      unit.extendStudent = (student) ->
        # test is already extended...
        if student.name?
          return
        student.open = false
        student.name = student.first_name + " " + student.last_name
        student.tutorial = unit.tutorialFromId( student.tute )[0]
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

      if loadStudents
        # Fetch the students for the unit
        Students.query { unit_id: unit.id, all: allStudents }, (students) ->
          # extend the students with their tutorial data
          unit.students = students.map (student) ->
            unit.extendStudent(student)
            student

      callback(unit)
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