import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { taskDefinition, Unit, currentUser, groupService, alertService } from 'src/app/ajs-upgraded-providers';
import { TasksOfTaskDefinitionPipe } from 'src/app/common/filters/tasks-of-task-definition.pipe';
import { TasksInTutorialsPipe } from 'src/app/common/filters/tasks-in-tutorials.pipe';
import { TasksWithStudentNamePipe } from 'src/app/common/filters/tasks-with-student-name.pipe';

@Component({
  selector: 'staff-task-list',
  templateUrl: './staff-task-list.component.html',
  styleUrls: ['./staff-task-list.component.scss']
})
export class StaffTaskListComponent implements OnInit, OnChanges {

  @Input() task: any;
  @Input() project: any;

  @Input() taskData;
  @Input() unit;
  @Input() unitRole;
  @Input() filters;
  @Input() showSearchOptions;

  submissionsPdfsUrl: string;
  submissionsUrl: string;
  userHasTutorials: boolean;
  filteredTasks: any[] = null;
  tutorials: any[] = null;
  tasks: any[] = null;

  watchingTaskKey: any;

  panelOpenState = false;

  isTaskDefMode: boolean;
  // Let's call having a source of tasksForDefinition plus having a task definition
  // auto-selected with the search options open task def mode -- i.e., the mode
  // for selecting tasks by task definitions

  constructor(
    @Inject(taskDefinition) private taskDef,
    @Inject(Unit) private Unit,
    @Inject(currentUser) private currentUser,
    @Inject(groupService) private groupService,
    @Inject(alertService) private alertService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.unit.currentValue.id) && ((changes.unit.previousValue.id !== changes.unit.currentValue.id)) || (this.tasks == null)) {
      this.refreshData();
    }
  }


  ngOnInit(): void {

    console.log(this.unitRole);

    // Does the current user have any tutorials?
    this.userHasTutorials = this.unit.tutorialsForUserName(this.currentUser.profile.name)?.length > 0;

    // Search option filters
    this.filteredTasks = [];


    this.filters = Object.assign({
      studentName: null,
      tutorialIdSelected: ((this.unitRole.role === 'Tutor' || 'Convenor') && (this.userHasTutorials)) ? 'mine' : 'all',
      tutorials: [],
      taskDefinitionIdSelected: null,
      taskDefinition: null
    }, this.filters);

    this.tutorials = [...[
      { id: 'all', inbox_description: 'All tutorials', abbreviation: '__all' },
      { id: 'mine', inbox_description: 'Just my tutorials', abbreviation: '__mine' }],
    ...this.unit.tutorials];

    this.tutorials = this.tutorials.map(tutorial => {
      if (!['all', 'mine'].includes(tutorial.id)) {
        if (tutorial.description.indexOf(tutorial.abbreviation) === -1) {
          console.log(tutorial);
          tutorial.inbox_description = `${tutorial.abbreviation} - ${tutorial.description}`;
        }
      }
      return tutorial;
    });

    this.isTaskDefMode = ((this.taskData?.source === this.Unit.tasksForDefinition) &&
      (this.filters?.taskDefinitionIdSelected) &&
      (this.showSearchOptions));

    if (this.isTaskDefMode) {
      this.submissionsPdfsUrl = this.taskDef.getSubmissionsPdfsUrl(this.unit.id, this.filters.taskDefinitionIdSelected);
      this.submissionsUrl = this.taskDef.getSubmissionsUrl(this.unit.id, this.filters.taskDefinitionIdSelected);
    }


    this.tutorialIdChanged();

    this.setTaskDefFromTaskKey(this.taskData.taskKey);

    // Initially not watching the task key
    this.watchingTaskKey = false;
  }

  refreshTasks(): void {
    this.refreshData();
  }

  applyFilters() {
    let pipe1 = new TasksOfTaskDefinitionPipe();
    let pipe2 = new TasksInTutorialsPipe();
    let pipe3 = new TasksWithStudentNamePipe();

    let filteredTasks = pipe1.transform(this.tasks, this.filters.taskDefinition);
    filteredTasks = pipe2.transform(filteredTasks, this.filters.tutorials);
    filteredTasks = pipe3.transform(filteredTasks, this.filters.studentName);
    this.filteredTasks = filteredTasks;

    // Fix selected task.
    if (this.taskData.selectedTask && (filteredTasks.includes(this.taskData.selectedTask))) {
      this.setSelectedTask(null);
    }
  }

  openTaskDefs() {
    // Automatically "open" the task definition select element if in task def mode
    // TODO: Remove any here
    let selectEl: any = <any>document.querySelector('select[ng-model="filters.taskDefinitionIdSelected"]');
    selectEl.size = 10;
    selectEl.focus();
  }

  tutorialIdChanged(): void {
    let tutorialId = this.filters.tutorialIdSelected;
    if (tutorialId === 'mine') {
      this.filters.tutorials = this.unit.tutorialsForUserName(this.currentUser.profile.name);
    } else if (tutorialId === 'all') {
      // Students not in tutorials but submitting work
      this.filters.tutorials = this.unit.tutorials.concat([{ id: null }]);
    } else {
      this.filters.tutorials = [this.unit.tutorialFromId(tutorialId)]
    }
    this.filters.tutorials = this.filters.tutorials.map(t => t.id);
    this.applyFilters();
  }

  //  Task definition options
  groupSetName(id: number) {
    if (this.unit.hasGroupwork()) {
      this.groupService.groupSetName(id, this.unit);
    }
  }

  taskDefinitionIdChanged() {
    this.submissionsUrl = this.taskDef.getSubmissionsUrl(this.unit.id, this.filters.taskDefinitionIdSelected);
    this.submissionsPdfsUrl = this.taskDef.getSubmissionsPdfsUrl(this.unit.id, this.filters.taskDefinitionIdSelected);
    let taskDefId = this.filters.taskDefinitionIdSelected;
    if (taskDefId) {
      let taskDef = this.unit.taskDef(taskDefId.id);
      this.filters.taskDefinition = taskDef;
    }
    if (this.isTaskDefMode) {
      this.refreshData();
    }
    this.applyFilters();
  }

  private setTaskDefFromTaskKey(taskKey) {
    //  Only applicable in taskDefMode
    if (!this.isTaskDefMode) {
      return;
    }
    let taskDef = this.unit.task_definitions.find({ abbreviation: taskKey?.taskDefAbbr }) || this.unit.task_definitions[0];
    this.filters.taskDefinitionIdSelected = taskDef.id;
    this.filters.taskDefinition = taskDef;
  }

  // # Finds a task (or null) given its task key
  private findTaskForTaskKey(key) {
    this.tasks.find((t) => t.hasTaskKey(key));
  }

  //  Callback to refresh data from the task source
  private refreshData() {
    // Tasks for feedback or tasks for task, depending on the data source
    this.taskData.source.query({ id: this.unit.id, task_def_id: this.filters?.taskDefinitionIdSelected },
      (response) => {
        console.log(response);
        this.tasks = this.unit.incorporateTasks(response, this.applyFilters.bind(this));
        // If loading via task definitions, fill
        if (this.isTaskDefMode) {
          let unstartedTasks = this.unit.fillWithUnStartedTasks(this.tasks, this.filters.taskDefinitionIdSelected);
          Object.assign(this.tasks, unstartedTasks);
        }
        //  Apply initial filters
        this.applyFilters();
        // Load initial set task, either the one provided(by the URL)
        // then load actual task in now or the first task that applies
        // to the given set of filters.
        let task = this.findTaskForTaskKey(this.taskData.taskKey);
        // $timeout((-> this.setSelectedTask(task)), 500);
        this.setSelectedTask(task);
        // For when URL has been manually changed, set the selected task
        // using new array of tasks loaded from the new taskKey
        if (!this.watchingTaskKey) {
          this.watchingTaskKey = true;
          // TODO: Investigate
          // listeners.push this.$watch 'taskData.taskKey', (newKey, oldKey) ->
          // return if _.isEqual(newKey, oldKey) || !newKey ?
          // // Task def mode and key assignment change ? Reload data with new key
          // if this.isTaskDefMode && newKey.taskDefAbbr != oldKey?.taskDefAbbr
          // setTaskDefFromTaskKey(this.taskData.taskKey)
          // refreshData()
          // else {
          //   //  Set initial filters if not taskDefMode to set correct task def
          //   this.setSelectedTask(findTaskForTaskKey(newKey))
          // }
        }
      },
      (error) => { this.alertService.add('danger', error.data.error, 6000); }
    );
  }

  setSelectedTask(task) {
    this.taskData.selectedTask = task;
    if (typeof this.taskData.onSelectedTaskChange === 'function') {
      this.taskData.onSelectedTaskChange(task);
    }
    if (task) {
      this.scrollToTaskInList(task);
    }
  }
  private scrollToTaskInList(task) {
    let taskEl = <any>document.querySelector(`staff-task-list #${task.taskKeyToIdString()}`);
    if (!taskEl) {
      return;
    }
    let funcName = taskEl.scrollIntoViewIfNeeded ? 'scrollIntoViewIfNeeded' : (taskEl.scrollIntoView ? 'scrollIntoView' : '');
    if (!funcName) {
      return;
    }
    taskEl[funcName]({ behavior: 'smooth', block: 'top' })
  }

  isSelectedTask(task) {
    let sameProject = this.taskData.selectedTask?.project().project_id === task.project().project_id;
    let sameTaskDef = this.taskData.selectedTask?.task_definition_id === task.task_definition_id;
    return sameProject && sameTaskDef;
  }


  // TODO: This
  // $timeout openTaskDefs if this.isTaskDefMode

}

//   controller: (this, $timeout, $filter, $window, Unit, taskService, alertService, currentUser, groupService, listenerService, dateService, projectService, TaskDefinition) ->
//     # Cleanup
//     listeners = listenerService.listenTo($scope)
//     # Check taskSource exists
//     unless $scope.taskData?.source?
//       throw Error "Invalid taskData.source provided for task list; supply one of Unit.tasksForTaskInbox, Unit.tasksRequiringFeedback, Unit.taskByTaskDefinition"
//     # showDate from date-service
//     $scope.showDate = dateService.showFullDate
//     # Does the current user have any tutorials?
//     $scope.userHasTutorials = $scope.unit.tutorialsForUserName(currentUser.profile.name)?.length > 0
//     # Search option filters
//     $scope.filteredTasks = []
//     $scope.filters = _.extend({
//       studentName: null
//       tutorialIdSelected: if ($scope.unitRole.role == 'Tutor' || 'Convenor') && $scope.userHasTutorials then 'mine' else 'all'
//       tutorials: []
//       taskDefinitionIdSelected: null
//       taskDefinition: null
//     }, $scope.filters)

//     # Sets the new filteredTasks variable
//     applyFilters = ->
//       filteredTasks = $filter('tasksOfTaskDefinition')($scope.tasks, $scope.filters.taskDefinition)
//       filteredTasks = $filter('tasksInTutorials')(filteredTasks, $scope.filters.tutorials)
//       filteredTasks = $filter('tasksWithStudentName')(filteredTasks, $scope.filters.studentName)
//       $scope.filteredTasks = filteredTasks

//       # Fix selected task.
//       if $scope.taskData.selectedTask && !_.includes(filteredTasks, $scope.taskData.selectedTask)
//         $scope.setSelectedTask(null)

//     openTaskDefs = ->
//       # Automatically "open" the task definition select element if in task def mode
//       selectEl = document.querySelector('select[ng-model="filters.taskDefinitionIdSelected"]')
//       selectEl.size = 10
//       selectEl.focus()
//     $timeout openTaskDefs if $scope.isTaskDefMode
//     # Tutorial options
//     $scope.tutorials = _.map($scope.unit.tutorials.concat([
//       { id: 'all',  description: 'All tutorials',     abbreviation: '__all'  }
//       { id: 'mine', description: 'Just my tutorials', abbreviation: '__mine' }
//     ]), (tutorial) ->
//       unless _.includes(['all', 'mine'], tutorial.id)
//         if tutorial.description.indexOf(tutorial.abbreviation) == -1
//           tutorial.description = tutorial.abbreviation + ' - ' + tutorial.description
//       tutorial
//     )
//     $scope.tutorialIdChanged = ->
//       tutorialId = $scope.filters.tutorialIdSelected
//       if tutorialId == 'mine'
//         $scope.filters.tutorials = $scope.unit.tutorialsForUserName(currentUser.profile.name)
//       else if tutorialId == 'all'
//         # Students not in tutorials but submitting work
//         $scope.filters.tutorials = _.concat($scope.unit.tutorials, [{id: null}])
//       else
//         $scope.filters.tutorials = [$scope.unit.tutorialFromId(tutorialId)]
//       $scope.filters.tutorials = _.map($scope.filters.tutorials, 'id')
//       applyFilters()
//     # Set initial tutorial scope
//     $scope.tutorialIdChanged()
//     # Task definition options
//     $scope.groupSetName = (id) ->
//       groupService.groupSetName(id, $scope.unit) if $scope.unit.hasGroupwork()
//     $scope.taskDefinitionIdChanged = ->
//       $scope.submissionsUrl = TaskDefinition.getSubmissionsUrl($scope.unit.id, $scope.filters.taskDefinitionIdSelected)
//       $scope.submissionsPdfsUrl = TaskDefinition.getSubmissionsPdfsUrl($scope.unit.id, $scope.filters.taskDefinitionIdSelected)
//       taskDefId = $scope.filters.taskDefinitionIdSelected
//       taskDef = $scope.unit.taskDef(taskDefId) if taskDefId?
//       $scope.filters.taskDefinition = taskDef
//       refreshData() if $scope.isTaskDefMode
//       applyFilters()
//     # Set new taskDefinitionIdSelected if task def mode and taskDefAbbr set
//     setTaskDefFromTaskKey = (taskKey) ->
//       # Only applicable in taskDefMode
//       return unless $scope.isTaskDefMode
//       taskDef = _.find($scope.unit.task_definitions, {abbreviation: taskKey?.taskDefAbbr}) || _.first($scope.unit.task_definitions)
//       $scope.filters.taskDefinitionIdSelected = taskDef.id
//       $scope.filters.taskDefinition = taskDef
//     setTaskDefFromTaskKey($scope.taskData.taskKey)
//     # Student Name options
//     $scope.studentNameChanged = applyFilters
//     # Finds a task (or null) given its task key
//     findTaskForTaskKey = (key) -> _.find($scope.tasks, (t) -> t.hasTaskKey(key))
//     # Initially not watching the task key
//     watchingTaskKey = false
//     # Callback to refresh data from the task source
//     refreshData = ->
//       # Tasks for feedback or tasks for task, depending on the data source
//       $scope.taskData.source.query { id: $scope.unit.id, task_def_id: $scope.filters.taskDefinitionIdSelected },
//         (response) ->
//           $scope.tasks = $scope.unit.incorporateTasks(response, applyFilters)
//           # If loading via task definitions, fill
//           if $scope.isTaskDefMode
//             unstartedTasks = $scope.unit.fillWithUnStartedTasks($scope.tasks, $scope.filters.taskDefinitionIdSelected)
//             _.extend($scope.tasks, unstartedTasks)
//           # Apply initial filters
//           applyFilters()
//           # Load initial set task, either the one provided (by the URL)
//           # then load actual task in now or the first task that applies
//           # to the given set of filters.
//           task = findTaskForTaskKey($scope.taskData.taskKey)
//           $timeout((-> $scope.setSelectedTask(task)), 500)
//           # For when URL has been manually changed, set the selected task
//           # using new array of tasks loaded from the new taskKey
//           unless watchingTaskKey
//             watchingTaskKey = true
//             listeners.push $scope.$watch 'taskData.taskKey', (newKey, oldKey) ->
//               return if _.isEqual(newKey, oldKey) || !newKey?
//               # Task def mode and key assignment change? Reload data with new key
//               if $scope.isTaskDefMode && newKey.taskDefAbbr != oldKey?.taskDefAbbr
//                 setTaskDefFromTaskKey($scope.taskData.taskKey)
//                 refreshData()
//               else
//                 # Set initial filters if not taskDefMode to set correct task def
//                 $scope.setSelectedTask(findTaskForTaskKey(newKey))
//         (response) ->
//           alertService.add("danger", response.data.error, 6000)
//     # Watch for changes in unit ID
//     listeners.push $scope.$watch 'unit.id', (newUnitId, oldUnitId) ->
//       return if !newUnitId? || (newUnitId == oldUnitId && $scope.tasks?)
//       refreshData()
//     # UI call to change currently selected task
//     $scope.setSelectedTask = (task) ->
//       $scope.taskData.selectedTask = task
//       $scope.taskData.onSelectedTaskChange?(task)
//       scrollToTaskInList(task) if task?
//     scrollToTaskInList = (task) ->
//       taskEl = document.querySelector("staff-task-list ##{task.taskKeyToIdString()}")
//       return unless taskEl?
//       funcName = if taskEl.scrollIntoViewIfNeeded? then 'scrollIntoViewIfNeeded' else if taskEl.scrollIntoView? then 'scrollIntoView'
//       return unless funcName?
//       taskEl[funcName]({behavior: 'smooth', block: 'top'})
//     $scope.isSelectedTask = (task) ->
//       sameProject = $scope.taskData.selectedTask?.project().project_id == task.project().project_id
//       sameTaskDef = $scope.taskData.selectedTask?.task_definition_id == task.task_definition_id
//       sameProject && sameTaskDef
// )
