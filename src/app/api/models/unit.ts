import { Entity, EntityCache, EntityMapping } from 'ngx-entity-service';
import { Observable } from 'rxjs';
import { AppInjector } from 'src/app/app-injector';
import { ProjectService } from '../services/project.service';
import { OverseerImage, User, TeachingPeriod, TaskDefinition, TutorialStream, Tutorial, TutorialEnrolment, GroupSet, Group, TaskOutcomeAlignment, GroupMembership, UnitService, Project, TutorialStreamService} from './doubtfire-model';
import { LearningOutcome } from './learning-outcome';
import { UnitRole } from './unit-role';

export class Unit extends Entity {
  id: number;
  code: string;
  name: string;
  description: string;

  active: boolean;

  myRole: string; //TODO: add more type details?
  mainConvenor: UnitRole;

  teachingPeriod: TeachingPeriod;
  startDate: Date; //TODO: or string
  endDate: Date; //TODO: or string

  assessmentEnabled: boolean;
  overseerImageId: number; // image needs to be lazy loadaed

  autoApplyExtensionBeforeDeadline: boolean;
  sendNotifications: boolean;
  enableSyncEnrolments: boolean;
  enableSyncTimetable: boolean;

  draftTaskDefinitionId: number; // task definition needs to be lazy loaded

  allowStudentExtensionRequests: boolean;
  extensionWeeksOnResubmitRequest: number;
  allowStudentChangeTutorial: boolean;

  public readonly learningOutcomesCache: EntityCache<LearningOutcome> = new EntityCache<LearningOutcome>();
  public readonly tutorialStreamsCache: EntityCache<TutorialStream> = new EntityCache<TutorialStream>();
  public readonly tutorialsCache: EntityCache<Tutorial> = new EntityCache<Tutorial>();
  // readonly tutorialEnrolments: EntityCache<TutorialEnrolment>;
  public readonly taskDefinitionCache: EntityCache<TaskDefinition> = new EntityCache<TaskDefinition>();
  public readonly taskOutcomeAlignmentsCache: EntityCache<TaskOutcomeAlignment> = new EntityCache<TaskOutcomeAlignment>();

  readonly staff: EntityCache<UnitRole> = new EntityCache<UnitRole>();

  public readonly groupSetsCache: EntityCache<GroupSet> = new EntityCache<GroupSet>();
  public readonly groupsCache: EntityCache<Group> = new EntityCache<Group>();

  groupMemberships: Array<GroupMembership>;

  readonly studentCache: EntityCache<Project> = new EntityCache<Project>();

  analytics: {} = {};

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      unit: super.toJson(mappingData, ignoreKeys),
    }
  }

  public findStudent(id: number): Project {
    return this.students.find( (s) => s.id === id);
  }

  public get currentUserIsStaff(): boolean {
    return this.myRole !== "Student";
  }

  public get currentUserIsConvenor(): boolean {
    return this.myRole === "Convenor" || this.myRole === "Admin";
  }

  public get taskDefinitions(): TaskDefinition[] {
    return this.taskDefinitionCache.currentValues;
  }

  public get tutorialStreams(): TutorialStream[] {
    return this.tutorialStreamsCache.currentValues;
  }

  public get tutorials(): Tutorial[] {
    return this.tutorialsCache.currentValues;
  }

  public get ilos(): LearningOutcome[] {
    return this.learningOutcomesCache.currentValues;
  }

  public get taskDefinitionCount(): number {
    return this.taskDefinitionCache.size;
  }

  public tutorialStreamForAbbr(abbr: string): TutorialStream {
    if (abbr) {
      return this.tutorialStreams.find(ts => ts.abbreviation === abbr);
    } else {
      return null;
    }
  }

  /**
   * Calculate how much time has elapsed in the teaching period, based on the start and
   * end date of the unit relative to the current date.
   *
   * @returns the percentage of the teaching period that has elapsed
   */
  public get teachingPeriodProgress() {
    const today = new Date();

    //use Math.abs to avoid sign
    if (today <= this.startDate) return 0;
    if (today >= this.endDate) return 100;

    const startToNow = Math.abs(today.valueOf() - this.startDate.valueOf());
    const totalDuration = Math.abs(this.endDate.valueOf() - this.startDate.valueOf());
    return Math.round((startToNow / totalDuration) * 100);
  }

  public get students(): Array<Project> {
    return this.studentCache.currentValues;
  }

  public tutorialsForUserName(userName: string): Array<Tutorial> {
    return this.tutorials.filter(tutorial => tutorial.tutorName === userName);
  }

  public incorporateTasks(tasks, callback) : Task[] {
    console.log("implement incorporate tasks");
    return [];
  }

  public fillWithUnStartedTasks(tasks: Task[], td: TaskDefinition) {
    console.log("implement fillWithUnStartedTasks");
    return [];
  }

  public refresh(onSuccess: (unit: Unit) => void, onFailure: (response: any) => void) {
    AppInjector.get(UnitService).get(this.id).subscribe( {
      next: (unit: Unit) => {
        console.log(unit === this);
      },
      error: (response: any) => {
      }
    });
        // if

        // Add a sequence from the order fetched from server
        // unit.task_definitions = _.map(unit.task_definitions, (taskDef, index, list) ->
        //   taskDef.seq = index
        //   taskDef.group_set = _.find(unit.group_sets, {id: taskDef.group_set_id}) if taskDef.group_set_id
        //   taskDef.hasPlagiarismCheck = -> taskDef.plagiarism_checks.length > 0
        //   taskDef.targetGrade = () -> gradeService.grades[taskDef.targetGrade]

        //   # Local deadline date is the last moment in the local time zone
        //   taskDef.localDeadlineDate = ()  ->
        //     deadline = new Date(taskDef.due_date.slice(0,10)) #TODO: Change backend to return this as "deadline_date"
        //     return moment({ year: deadline.getFullYear(), month: deadline.getMonth(), day: deadline.getDate(), hour: 23, minute: 59, second: 59})
        //   # Final deadline date should not be shown, but is the actual deadline based on "anywhere on earth" timezone
        //   taskDef.finalDeadlineDate = ()  ->
        //     deadline = new Date(taskDef.due_date.slice(0,10)) #TODO: Change backend to return this as "deadline_date"
        //     return moment({ year: deadline.getFullYear(), month: deadline.getMonth(), day: deadline.getDate(), hour: 23, minute: 59, second: 59}, '-12:00')
        //   taskDef.localDueDate = ()  ->
        //     due = new Date(taskDef.target_date.slice(0,10))
        //     return moment({ year: due.getFullYear(), month: due.getMonth(), day: due.getDate(), hour: 23, minute: 59, second: 59})
        //   taskDef
        // )

        // If loading students, call the onSuccess callback as unit.refreshStudents callback
        // otherwise done!
      //   return onSuccess?(unit) unless options?.loadOnlyEnrolledStudents || options?.loadAllStudents
      //   unit.refreshStudents(onSuccess, onFailure)
      // failureCallback = (response) ->
      //   alertService.add("danger", "Failed to load unit. #{response?.data?.error}", 8000)
      //   onFailure?(response)
  }

  public tutorialFromId(tutorialId: number): Tutorial {
    return this.tutorialsCache.get(tutorialId);
  }

  public get hasGroupwork(): boolean {
    return this.groupSetsCache.size > 0;
  }

  public taskDef(taskDefId: number): TaskDefinition {
    return this.taskDefinitionCache.get(taskDefId);
  }

  public get taskOutcomeAlignments(): TaskOutcomeAlignment[] {
    return this.taskOutcomeAlignmentsCache.currentValues;
  }

  public staffAlignmentsForTaskDefinition(td: TaskDefinition): TaskOutcomeAlignment[] {
    return this.taskOutcomeAlignments.filter( (alignment: TaskOutcomeAlignment) => {
      alignment.taskDefinition.id === td.id;
    }).sort((a: TaskOutcomeAlignment, b: TaskOutcomeAlignment) => {
      return a.learningOutcome.iloNumber - b.learningOutcome.iloNumber;
    });
  }

  public nextStream(activityTypeAbbreviation): Observable<TutorialStream> {
    console.log("implement nextStream");
    return null;
  }

  public deleteStream(stream: TutorialStream) {
    console.log("implement deleteStream");
    return;
  }

  public refreshStudents() {
    console.log("implement refreshStudents");
  }

  public findProjectForUsername(username: string): Project {
    return this.students.find( (s) => s.student.username === username);
  }

  public get groups(): Group[] {
    return this.groupsCache.currentValues;
  }

  public get groupSets(): GroupSet[] {
    return this.groupSetsCache.currentValues;
  }

}
