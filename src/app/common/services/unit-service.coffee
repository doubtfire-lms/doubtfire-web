angular.module("doubtfire.common.services.units", [])

.factory("unitService", (Unit, UnitRole, Students, Group, projectService, groupService, gradeService, taskService, $filter, $rootScope, analyticsService, PortfolioSubmission, alertService, Project, $state, TeachingPeriod) ->
  #
  # The unit service object
  #
  unitService = {}

  unitService.loadedUnits = {}
  unitService.loadedUnitRoles = null

  injectFunctionalityInUnitRole = (unitRole) ->
    unless unitRole.teachingPeriod?
      # Store the linked teaching period in each unit role
      unitRole._teachingPeriod = null
      unitRole.teachingPeriod = () ->
        # If there is a teaching period and it is not linked... link on first access
        if unitRole.teaching_period_id? && ! unitRole._teachingPeriod?
          unitRole._teachingPeriod = TeachingPeriod.getTeachingPeriod(unitRole.teaching_period_id)
        # Return the first role
        unitRole._teachingPeriod
    unitRole

  $rootScope.$on 'signOut', ->
    unitService.loadedUnits = {}
    unitService.loadedUnitRoles = null

  unitService.getUnitRoles = (callback) ->
    fireCallback = ->
      callback(unitService.loadedUnitRoles) if _.isFunction(callback)
    unless unitService.loadedUnitRoles?
      UnitRole.query (roles) ->
        unitService.loadedUnitRoles = _.map roles, (r) -> injectFunctionalityInUnitRole(r)
        fireCallback()
    else
      fireCallback()

  #
  # Gets a unit by its ID number
  #
  # Options is a hash with two keys:
  #   - loadOnlyEnrolledStudents will load enrolled students in the unit
  #   - loadAllStudents will load all students instead of just those enrolled
  #
  # If you don't want to provide any options, it will default both to false, and
  # instead use pass in the onSuccess and onFailure callbacks to the 2nd and
  # 3rd argument:
  #
  #    unitService.getUnit(1,
  #     (unit) -> $scope.unit = unit
  #     (error) -> $scope.error = error
  #    )
  #
  unitService.getUnit = (unitId, options, onSuccess, onFailure) ->
    # Passed success callback to options? Default options
    if _.isFunction(options)
      # Switch onSuccess argument to options (they passed this in as a function pointer)
      onSuccess = options
      onFailure = onSuccess if _.isFunction(onSuccess)
      options = { loadAllStudents: false, loadOnlyEnrolledStudents: false }

    # Return cached unit
    result = unitService.loadedUnits[unitId]
    return onSuccess?(result) if result

    # Load all and load only enrolled cannot both be true
    if options.loadAllStudents && options.loadOnlyEnrolledStudents
      throw Error "Load all and only enrolled cannot both be true"

    # Initial unit model
    unit = {
      analytics: {}
    }

    #
    # Refresh the unit with data from the server...
    #
    unit.refresh = (onSuccess, onFailure) ->
      successCallback = (newUnit) ->
        _.extend(unit, newUnit)
        # Map extra utility to tutorials
        unit.tutorials = _.map(unit.tutorials, (tutorial) ->
          tutorial.description = unitService.tutorialDescription(tutorial)
          tutorial
        )
        # Add a sequence from the order fetched from server
        unit.task_definitions = _.map(unit.task_definitions, (taskDef, index, list) ->
          taskDef.seq = index
          taskDef.group_set = _.find(unit.group_sets, {id: taskDef.group_set_id}) if taskDef.group_set_id
          taskDef.hasPlagiarismCheck = -> taskDef.plagiarism_checks.length > 0
          taskDef.targetGrade = () -> gradeService.grades[taskDef.target_grade]
          taskDef
        )
        # If loading students, call the onSuccess callback as unit.refreshStudents callback
        # otherwise done!
        return onSuccess?(unit) unless options?.loadOnlyEnrolledStudents || options?.loadAllStudents
        unit.refreshStudents(onSuccess, onFailure)
      failureCallback = (response) ->
        alertService.add("danger", "Failed to load unit. #{response?.data?.error}", 8000)
        onFailure?(response)
      # Make request
      Unit.get({ id: unitId }, successCallback, failureCallback)

    # Allow the caller to fetch a task definition from the unit based on its id
    unit.taskDef = (taskDef) ->
      unless _.isObject(taskDef) || _.isNumber(taskDef)
        throw Error "Task def must be a number or task definition object"
      taskDefId = if _.isObject(taskDef) then taskDef.task_definition_id else taskDef
      _.find unit.task_definitions, {id: taskDefId}

    # Find an outcome by its outcome id
    unit.outcome = (outcomeId) ->
      _.find unit.ilos, {id: outcomeId}

    # Allow the caller to fetch a tutorial from the unit based on its id
    unit.tutorialFromId = (tuteId) ->
      _.find unit.tutorials, { id: +tuteId }

    # Extend unit to know task count
    unit.taskCount = -> unit.task_definitions.length

    # Returns all tutorials where the tutor name matches the user name provided
    unit.tutorialsForUserName = (userName) ->
      _.filter unit.tutorials, (tutorial) -> tutorial.tutor_name is userName

    # Refresh callback for reloading students
    unit.refreshStudents = (onSuccess, onFailure) ->
      successCallback = (students) ->
        # extend the students with their tutorial data
        unit.students = _.map(students, (s) -> unitService.mapStudentToUnit(unit, s))
        onSuccess?(unit)
      failureCallback = (response) ->
        alertService.add("danger", "Failed to load students. #{response?.data?.error}", 8000)
        onFailure?(response)
      # Fetch the students for the unit
      requestToLoadAll = !options?.loadOnlyEnrolledStudents || options?.loadAllStudents
      Students.query({ unit_id: unit.id, all: requestToLoadAll }, successCallback, failureCallback)

    # Returns whether the specified project ID is of an enrolled student or not
    unit.studentEnrolled = (id) ->
      unit.findStudent(id)?.enrolled

    # Finds a student in this unit given their project ID
    unit.findStudent = (id) ->
      unless unit.students?
        throw Error "Students not yet mapped to unit (unit.students is undefined)"
      _.find(unit.students, {project_id: id})

    # Adds a new student to this unit
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
      unitService.mapStudentToUnit(unit, student)

    # Returns all active (enrolled) students in the unit
    unit.activeStudents = ->
      _.filter(unit.students, {enrolled: true})

    # Map extra functionality to student
    unit.mapStudentToUnit = (student) ->
      unitService.mapStudentToUnit(unit, student)

    # Return a group set given its ID
    unit.findGroupSet = (id) ->
      _.find(unit.group_sets, {id: +id})

    # Maps unit-related information to a group
    unit.mapGroupToUnit = (group) ->
      unitService.mapGroupToUnit(unit, group)

    # Refresh the groups within the unit
    unit.refreshGroups = () ->
      return unless unit.groups?
      # Query the groups within the unit.
      Unit.groups.query( {id: unit.id} ,
        (success) ->
          # Save the result as the unit's groups
          unit.groups = success
        (failure) ->
          alertService.add("danger", "Error refreshing unit groups: " + (failure.data?.error || "Unknown cause"), 6000)
      )
    
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
    unit.incorporateTasks = (tasks, callback) ->
      _.map tasks, (t) ->
        project = unit.findStudent(t.project_id)
        if project?
          unless project.incorporateTask?
            projectService.mapTask t, unit, project
            projectService.addProjectMethods(project, unit)
          project.incorporateTask(t, callback)


    #
    # Add any missing tasks and return the new collection
    #
    unit.fillWithUnStartedTasks = (tasks, taskDef) ->
      return unless unit.students?

      # Make sure the task definition is a task definition object from the unit
      taskDef = unit.taskDef(taskDef)

      # Now fill for the students in the unit
      _.map unit.students, (p) ->
        t = _.find tasks, (t) -> t.project_id == p.project_id && t.task_definition_id == taskDef.id
        unless t?
          t = _.find p.tasks, (t) -> t.task_definition_id == taskDef.id
        # If a group task but group data not loaded, go fetch it
        if t.isGroupTask() and !t.group()?
          projectService.updateGroups(t.project(), null, true)
        t


    unit.staffAlignmentsForTaskDefinition = (td) ->
      return if ! td?
      filteredAlignments = $filter('taskDefinitionFilter')(unit.task_outcome_alignments, td.id)
      _.chain(filteredAlignments).map((a) ->
        a.ilo = unit.outcome(a.learning_outcome_id)
        a
      )
      .sortBy((a) -> a.ilo.ilo_number)
      .value()

    # Actually make the request to refresh and load unit data
    unit.refresh(onSuccess, onFailure)
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
    if (tutorial?)
      timeDesc = $filter('date')(tutorial.meeting_time, 'shortTime')
      "#{tutorial.meeting_day.slice(0,3)} at #{timeDesc} by #{tutorial.tutor_name} in #{tutorial.meeting_location}"
    else
      "No Tutorial"

  #
  # Adds additional unit-related functionality to groups
  #
  unitService.mapGroupToUnit = (unit, group) ->
    group.tutorial = -> unit.tutorialFromId(group.tutorial_id)
    group.unit = -> unit
    group

  #
  # Adds additional unit-related functionality to units
  #
  unitService.mapStudentToUnit = (unit, student) ->
    # Student is already extended if name exists
    return student if student.name?

    # Finds a task for this student given the specified task definition ID
    student.findTaskForDefinition = (taskDefId) ->
      _.find(student.tasks, {task_definition_id: taskDefId})

    # Returns the unit for this student
    student.unit = -> unit

    # Add a tutorial description
    student.tutorialDescription = () ->
      unitService.tutorialDescription(student.tutorial)

    student.shortTutorialDescription = () ->
      if student.tutorial?
        timeDesc = $filter('date')(student.tutorial.meeting_time, 'shortTime')
        "#{student.tutorial.meeting_day.slice(0,3)} #{timeDesc} - #{student.tutorial.tutor_name.split(' ')[0]} - #{student.tutorial.meeting_location}"
      else
        'No Tutorial'

    # Switch's the student's current tutorial to a new tutorial, either specified
    # by object or id.
    student.switchToTutorial = (tutorial) ->
      newId = if tutorial? then (if _.isString(tutorial) || _.isNumber(tutorial) then +tutorial else tutorial?.id) else -1
      analyticsService.event 'Teacher View - Students Tab', 'Changed Student Tutorial'
      Project.update({ id: student.project_id, tutorial_id: newId },
        (project) ->
          alertService.add "success", "Tutorial updated for #{student.name}", 3000
          student.tutorial_id = project.tutorial_id
          student.tutorial = student.unit().tutorialFromId( student.tutorial_id )
        (response) ->
          alertService.add "danger", "Failed to change tutorial. #{response?.data?.error}", 8000
      )

    # TODO: (@alexcu) change these to use functions...

    # Assigns the student's full name
    student.name = "#{student.first_name} #{student.last_name}"

    # Assigns the student's portfolio status (1 if has porfolio, 0.5 if currently compiling)
    if student.has_portfolio
      student.portfolio_status = 1
    else if student.compile_portfolio
      student.portfolio_status = 0.5
    else
      student.portfolio_status = 0

    # Returns a list of all active tasks of the student
    student.activeTasks = ->
      _.filter(student.tasks, (task) -> task.definition.target_grade <= student.target_grade)

    # Assigns the student's tutorial from the unit
    student.tutorial = unit.tutorialFromId(student.tutorial_id)

    # Returns this student's tutor's name or 'N/A' if the student is not in any tutorials
    student.tutorName = ->
      student.tutorial?.tutor_name || 'N/A'

    # Students task statistics (for bar)
    student.task_stats = [
      { value: 0, key: taskService.statusKeys[10] }
      { value: 0, key: taskService.statusKeys[0]  }
      { value: 0, key: taskService.statusKeys[4]  }
      { value: 0, key: taskService.statusKeys[6]  }
      { value: 0, key: taskService.statusKeys[9]  }
    ]

    # Enable the student/project to be able to switch to its view
    student.viewProject = (as_tutor) ->
      $state.go("projects/dashboard", {projectId: student.project_id, tutor: as_tutor})

    # Returns the student's portfolio submission URL
    student.portfolioUrl = ->
      PortfolioSubmission.getPortfolioUrl(student)

    student.portfolioUrlAsAttachment = ->
      PortfolioSubmission.getPortfolioUrl(student, true)

    # Assigns a grade to a student
    student.assignGrade = (score, rationale) ->
      Project.update { id: student.project_id, grade: score, old_grade:student.grade, grade_rationale: rationale },
        (project) ->
          student.grade = project.grade
          student.grade_rationale = project.grade_rationale
          alertService.add("success", "Grade updated.", 2000)
        (response) ->
          alertService.add("danger", "Grade was not updated: #{response.data.error}", 8000)

    # Call projectService update functions to update stats and task details
    projectService.addProjectMethods(student)
    student.updateTaskStats(student.stats) if student.stats?
    projectService.addTaskDetailsToProject(student, unit)

    # Return the mapped student
    student

  unitService
)
