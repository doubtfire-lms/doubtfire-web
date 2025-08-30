import { Component, OnInit, OnDestroy } from '@angular/core';
import { UIRouter } from '@uirouter/core';
import { UnitService, Unit } from 'src/app/api/models/doubtfire-model';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
import { Subscription } from 'rxjs';

// Define interfaces locally for now
interface TutorTimesStats {
  tutor_id: number;
  tutor_name: string;
  unit_code: string;
  total_sessions: number;
  total_duration_minutes: number;
  tasks_assessed: number;
  last_activity: string;
}

interface TaskTimesData {
  task_name: string;
  total_time_minutes: number;
  assessment_count: number;
  average_time_per_assessment: number;
}

// Additional interfaces for complete backend integration
interface MarkingSession {
  id: number;
  marker_id: number;
  unit_id: number;
  ip_address: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  marker_name?: string;
  unit_code?: string;
  is_active?: boolean; // For real-time monitoring
}

interface SessionActivity {
  id: number;
  marking_session_id: number;
  action: string; // 'inbox', 'GET', 'assessing'
  project_id?: number;
  task_id?: number;
  task_definition_id?: number;
  created_at: string;
  updated_at: string;
  duration_minutes?: number; // Time spent on this activity
}

interface AssessmentDetail {
  task_id: number;
  task_name: string;
  project_id: number;
  student_name: string;
  assessment_start: string;
  assessment_end?: string;
  duration_minutes: number;
  session_id: number;
  tutor_name: string;
}

interface SessionAnalytics {
  total_sessions: number;
  active_sessions: number;
  average_session_duration: number;
  total_assessments: number;
  average_assessment_time: number;
  session_completion_rate: number;
  most_active_tutors: Array<{
    tutor_name: string;
    sessions_count: number;
    total_time: number;
  }>;
}

interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
  tutorIds?: number[];
  taskDefinitionIds?: number[];
  unitIds?: number[];
  includeActiveSessions?: boolean;
}

@Component({
  selector: 'f-tutor-times',
  templateUrl: './tutor-times.component.html',
  styleUrls: ['./tutor-times.component.scss']
})
export class TutorTimesComponent implements OnInit, OnDestroy {
  unit: Unit | undefined;
  unitRole: string | undefined;
  units: string[] = [];
  selectedUnit: string | undefined;
  private unitId: number | undefined;

  // Real data from marking sessions
  taskTimesData: TaskTimesData[] = [];
  tutorTimesStats: TutorTimesStats[] = [];
  allUnitsTutorTimes: { [unitCode: string]: TutorTimesStats[] } = {};

  // Additional data for complete backend integration
  markingSessions: MarkingSession[] = [];
  sessionActivities: SessionActivity[] = [];
  assessmentDetails: AssessmentDetail[] = [];
  sessionAnalytics: SessionAnalytics | undefined;
  activeSessions: MarkingSession[] = [];

  // Filtering and UI state
  filterOptions: FilterOptions = {};
  showActiveSessions = true;
  showSessionDetails = false;
  selectedSessionId: number | undefined;

  // Cached chart data for performance
  private _taskTimesChartData: Array<{name: string, value: number}> = [];
  private _tutorTimesGroupedData: Array<{name: string, series: Array<{name: string, value: number}>}> = [];
  private _sessionActivityData: Array<{name: string, value: number}> = [];
  private _assessmentTrendData: Array<{name: string, series: Array<{name: string, value: number}>}> = [];
  private _dataVersion = 0;

  // Chart configuration
  view: [number, number] = [1000, 500];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Tasks';
  yAxisLabel = 'Time Spent (minutes)';
  colorScheme = {
    domain: ['#a259f7', '#6ec6ff', '#ff8a65', '#ffb347', '#b4ff65']
  };

  // Loading states
  isLoading = true;
  error: string | undefined;
  isRefreshing = false;

  // Template helper
  Object = Object;

  // Table column definitions
  taskTableColumns = ['task_name', 'total_time_minutes', 'assessment_count', 'average_time_per_assessment'];
  tutorTableColumns = ['tutor_name', 'total_sessions', 'total_duration_minutes', 'tasks_assessed', 'last_activity'];

  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private unitService: UnitService,
    private router: UIRouter,
    private globalState: GlobalStateService
  ) {}

  ngOnInit() {
    this.loadUnitAndData();
  }

  ngOnDestroy() {
    // Clean up all subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // TrackBy functions for performance optimization
  trackByUnit(index: number, unit: string): string {
    return unit;
  }

  trackByTask(index: number, task: TaskTimesData): string {
    return task.task_name;
  }

  trackByTutor(index: number, tutor: TutorTimesStats): number {
    return tutor.tutor_id;
  }

  trackByUnitCode(index: number, unitCode: string): string {
    return unitCode;
  }

  trackBySession(index: number, session: MarkingSession): number {
    return session.id;
  }

  trackByActivity(index: number, activity: SessionActivity): number {
    return activity.id;
  }



  // Refresh functionality
  refreshData() {
    this.isRefreshing = true;
    this.loadMarkingSessionData();
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }

  private loadUnitAndData() {
    const params: Record<string, unknown> = this.router.globals.params || {};
    const parsedUnitId = params.unitId ? Number(params.unitId) : undefined;
    this.unitId = Number.isFinite(parsedUnitId) ? parsedUnitId : undefined;

    if (this.unitId) {
      const unitSub = this.unitService.get(this.unitId).subscribe({
        next: (unit) => {
          this.unit = unit;
          // Safely access myRole property
          this.unitRole = (unit as unknown as { myRole?: string }).myRole;
          this.loadUnitsList();
          this.loadMarkingSessionData();
        },
        error: (err) => {
          this.error = 'Failed to load unit data';
          this.isLoading = false;
        }
      });
      this.subscriptions.push(unitSub);
    } else {
      this.loadUnitsList();
      this.loadAllUnitsData();
    }
  }

  private loadUnitsList() {
    const rolesSub = this.globalState.unitRolesSubject.subscribe((roles) => {
      this.units = roles.map((r) => r.unit.code).filter((c) => !!c);
      if (!this.selectedUnit && this.units.length > 0) {
        this.selectedUnit = this.unit?.code || this.units[0];
      }
    });
    this.subscriptions.push(rolesSub);
  }

  private loadMarkingSessionData() {
    if (!this.unitId) return;

    this.isLoading = true;

    // Load dummy data immediately without artificial delay
    this.loadDummyTaskTimesData();
    this.loadDummyTutorTimesStats();
    this.loadDummyMarkingSessions();
    this.loadDummySessionActivities();
    this.loadDummyAssessmentDetails();
    this.loadDummySessionAnalytics();
    this.isLoading = false;


  }

  private loadAllUnitsData() {
    // Load dummy data immediately without artificial delay
    this.loadDummyAllUnitsData();
    this.isLoading = false;


  }

  // Dummy data methods for development
  private loadDummyTaskTimesData() {
    this.taskTimesData = [
      {
        task_name: 'Task 1.1P - Introduction to Programming',
        total_time_minutes: 145,
        assessment_count: 18,
        average_time_per_assessment: 8.06
      },
      {
        task_name: 'Task 1.2C - Programming Concepts',
        total_time_minutes: 203,
        assessment_count: 22,
        average_time_per_assessment: 9.23
      },
      {
        task_name: 'Task 2.1P - Data Structures',
        total_time_minutes: 167,
        assessment_count: 15,
        average_time_per_assessment: 11.13
      },
      {
        task_name: 'Task 2.2C - Algorithms',
        total_time_minutes: 189,
        assessment_count: 16,
        average_time_per_assessment: 11.81
      },
      {
        task_name: 'Task 3.1P - Object-Oriented Programming',
        total_time_minutes: 234,
        assessment_count: 20,
        average_time_per_assessment: 11.7
      }
    ];
    this.updateChartDataCache();
  }

  private loadDummyTutorTimesStats() {
    this.tutorTimesStats = [
      {
        tutor_id: 101,
        tutor_name: 'Dr. John Smith',
        unit_code: this.unit?.code || 'SIT102',
        total_sessions: 12,
        total_duration_minutes: 480,
        tasks_assessed: 67,
        last_activity: '2024-01-15T16:45:23Z'
      },
      {
        tutor_id: 102,
        tutor_name: 'Dr. Sarah Johnson',
        unit_code: this.unit?.code || 'SIT102',
        total_sessions: 8,
        total_duration_minutes: 320,
        tasks_assessed: 42,
        last_activity: '2024-01-15T17:12:08Z'
      },
      {
        tutor_id: 103,
        tutor_name: 'Prof. Michael Brown',
        unit_code: this.unit?.code || 'SIT102',
        total_sessions: 15,
        total_duration_minutes: 600,
        tasks_assessed: 78,
        last_activity: '2024-01-15T18:03:45Z'
      },
      {
        tutor_id: 104,
        tutor_name: 'Dr. Emily Davis',
        unit_code: this.unit?.code || 'SIT102',
        total_sessions: 6,
        total_duration_minutes: 240,
        tasks_assessed: 31,
        last_activity: '2024-01-15T15:28:12Z'
      }
    ];
  }

  private loadDummyAllUnitsData() {
    this.allUnitsTutorTimes = {
      'SIT102': [
        {
          tutor_id: 101,
          tutor_name: 'Dr. John Smith',
          unit_code: 'SIT102',
          total_sessions: 12,
          total_duration_minutes: 480,
          tasks_assessed: 67,
          last_activity: '2024-01-15T16:45:23Z'
        },
        {
          tutor_id: 102,
          tutor_name: 'Dr. Sarah Johnson',
          unit_code: 'SIT102',
          total_sessions: 8,
          total_duration_minutes: 320,
          tasks_assessed: 42,
          last_activity: '2024-01-15T17:12:08Z'
        }
      ],
      'SIT123': [
        {
          tutor_id: 103,
          tutor_name: 'Prof. Michael Brown',
          unit_code: 'SIT123',
          total_sessions: 15,
          total_duration_minutes: 600,
          tasks_assessed: 78,
          last_activity: '2024-01-15T18:03:45Z'
        },
        {
          tutor_id: 105,
          tutor_name: 'Dr. Robert Wilson',
          unit_code: 'SIT123',
          total_sessions: 10,
          total_duration_minutes: 400,
          tasks_assessed: 52,
          last_activity: '2024-01-15T16:22:31Z'
        },
        {
          tutor_id: 106,
          tutor_name: 'Dr. Lisa Chen',
          unit_code: 'SIT123',
          total_sessions: 7,
          total_duration_minutes: 280,
          tasks_assessed: 38,
          last_activity: '2024-01-15T17:45:19Z'
        }
      ],
      'SIT333': [
        {
          tutor_id: 107,
          tutor_name: 'Dr. James Anderson',
          unit_code: 'SIT333',
          total_sessions: 9,
          total_duration_minutes: 360,
          tasks_assessed: 45,
          last_activity: '2024-01-15T18:15:42Z'
        },
        {
          tutor_id: 108,
          tutor_name: 'Prof. Maria Garcia',
          unit_code: 'SIT333',
          total_sessions: 11,
          total_duration_minutes: 440,
          tasks_assessed: 58,
          last_activity: '2024-01-15T17:33:27Z'
        }
      ],
      'SIT374': [
        {
          tutor_id: 109,
          tutor_name: 'Dr. David Thompson',
          unit_code: 'SIT374',
          total_sessions: 6,
          total_duration_minutes: 240,
          tasks_assessed: 32,
          last_activity: '2024-01-15T16:58:14Z'
        }
      ],
      'SIT330': [
        {
          tutor_id: 110,
          tutor_name: 'Dr. Jennifer Lee',
          unit_code: 'SIT330',
          total_sessions: 13,
          total_duration_minutes: 520,
          tasks_assessed: 69,
          last_activity: '2024-01-15T18:22:05Z'
        },
        {
          tutor_id: 111,
          tutor_name: 'Prof. Christopher Taylor',
          unit_code: 'SIT330',
          total_sessions: 8,
          total_duration_minutes: 320,
          tasks_assessed: 41,
          last_activity: '2024-01-15T17:08:33Z'
        }
      ]
    };
    this.updateChartDataCache();
  }

  // Additional dummy data methods for complete backend integration
  private loadDummyMarkingSessions() {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    this.markingSessions = [
      {
        id: 1001,
        marker_id: 101,
        unit_id: this.unitId || 1,
        ip_address: '192.168.1.100',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T12:30:00Z',
        duration_minutes: 150,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T12:30:00Z',
        marker_name: 'Dr. John Smith',
        unit_code: this.unit?.code || 'SIT102',
        is_active: false
      },
      {
        id: 1002,
        marker_id: 102,
        unit_id: this.unitId || 1,
        ip_address: '192.168.1.101',
        start_time: '2024-01-15T14:00:00Z',
        end_time: '2024-01-15T15:30:00Z',
        duration_minutes: 90,
        created_at: '2024-01-15T14:00:00Z',
        updated_at: '2024-01-15T15:30:00Z',
        marker_name: 'Dr. Sarah Johnson',
        unit_code: this.unit?.code || 'SIT102',
        is_active: false
      },
      {
        id: 1003,
        marker_id: 103,
        unit_id: this.unitId || 1,
        ip_address: '192.168.1.102',
        start_time: '2024-01-15T16:00:00Z',
        duration_minutes: 45,
        created_at: '2024-01-15T16:00:00Z',
        updated_at: fifteenMinutesAgo.toISOString(),
        marker_name: 'Prof. Michael Brown',
        unit_code: this.unit?.code || 'SIT102',
        is_active: true
      },
      {
        id: 1004,
        marker_id: 104,
        unit_id: this.unitId || 1,
        ip_address: '192.168.1.103',
        start_time: '2024-01-15T17:00:00Z',
        duration_minutes: 30,
        created_at: '2024-01-15T17:00:00Z',
        updated_at: now.toISOString(),
        marker_name: 'Dr. Emily Davis',
        unit_code: this.unit?.code || 'SIT102',
        is_active: true
      },
      {
        id: 1005,
        marker_id: 101,
        unit_id: this.unitId || 1,
        ip_address: '192.168.1.104',
        start_time: '2024-01-15T18:00:00Z',
        duration_minutes: 20,
        created_at: '2024-01-15T18:00:00Z',
        updated_at: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        marker_name: 'Dr. John Smith',
        unit_code: this.unit?.code || 'SIT102',
        is_active: true
      }
    ];
    this.activeSessions = this.getActiveSessions();
  }

  private loadDummySessionActivities() {
    this.sessionActivities = [
      {
        id: 2001,
        marking_session_id: 1001,
        action: 'inbox',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        duration_minutes: 5
      },
      {
        id: 2002,
        marking_session_id: 1001,
        action: 'assessing',
        project_id: 1001,
        task_id: 2001,
        task_definition_id: 3001,
        created_at: '2024-01-15T10:05:00Z',
        updated_at: '2024-01-15T10:25:00Z',
        duration_minutes: 20
      },

      {
        id: 2004,
        marking_session_id: 1001,
        action: 'assessing',
        project_id: 1002,
        task_id: 2002,
        task_definition_id: 3001,
        created_at: '2024-01-15T10:26:00Z',
        updated_at: '2024-01-15T10:45:00Z',
        duration_minutes: 19
      },

      {
        id: 2006,
        marking_session_id: 1002,
        action: 'inbox',
        created_at: '2024-01-15T14:00:00Z',
        updated_at: '2024-01-15T14:00:00Z',
        duration_minutes: 3
      },
      {
        id: 2007,
        marking_session_id: 1002,
        action: 'assessing',
        project_id: 1003,
        task_id: 2003,
        task_definition_id: 3002,
        created_at: '2024-01-15T14:03:00Z',
        updated_at: '2024-01-15T15:30:00Z',
        duration_minutes: 87
      },
      {
        id: 2008,
        marking_session_id: 1003,
        action: 'inbox',
        created_at: '2024-01-15T16:00:00Z',
        updated_at: '2024-01-15T16:00:00Z',
        duration_minutes: 2
      },
      {
        id: 2009,
        marking_session_id: 1003,
        action: 'assessing',
        project_id: 1004,
        task_id: 2004,
        task_definition_id: 3003,
        created_at: '2024-01-15T16:02:00Z',
        updated_at: '2024-01-15T16:45:00Z',
        duration_minutes: 43
      },
      {
        id: 2010,
        marking_session_id: 1004,
        action: 'inbox',
        created_at: '2024-01-15T17:00:00Z',
        updated_at: '2024-01-15T17:00:00Z',
        duration_minutes: 4
      },
      {
        id: 2011,
        marking_session_id: 1004,
        action: 'assessing',
        project_id: 1005,
        task_id: 2005,
        task_definition_id: 3004,
        created_at: '2024-01-15T17:04:00Z',
        updated_at: '2024-01-15T17:30:00Z',
        duration_minutes: 26
      },
      {
        id: 2012,
        marking_session_id: 1005,
        action: 'inbox',
        created_at: '2024-01-15T18:00:00Z',
        updated_at: '2024-01-15T18:00:00Z',
        duration_minutes: 3
      },
      {
        id: 2013,
        marking_session_id: 1005,
        action: 'assessing',
        project_id: 1006,
        task_id: 2006,
        task_definition_id: 3005,
        created_at: '2024-01-15T18:03:00Z',
        updated_at: '2024-01-15T18:20:00Z',
        duration_minutes: 17
      }
    ];
  }

  private loadDummyAssessmentDetails() {
    this.assessmentDetails = [
      {
        task_id: 2001,
        task_name: 'Task 1.1P - Introduction to Programming',
        project_id: 1001,
        student_name: 'Alice Johnson',
        assessment_start: '2024-01-15T10:05:00Z',
        assessment_end: '2024-01-15T10:25:00Z',
        duration_minutes: 20,
        session_id: 1001,
        tutor_name: 'Dr. John Smith'
      },
      {
        task_id: 2002,
        task_name: 'Task 1.1P - Introduction to Programming',
        project_id: 1002,
        student_name: 'Bob Smith',
        assessment_start: '2024-01-15T10:26:00Z',
        assessment_end: '2024-01-15T10:45:00Z',
        duration_minutes: 19,
        session_id: 1001,
        tutor_name: 'Dr. John Smith'
      },
      {
        task_id: 2003,
        task_name: 'Task 1.2C - Programming Concepts',
        project_id: 1003,
        student_name: 'Charlie Brown',
        assessment_start: '2024-01-15T14:03:00Z',
        assessment_end: '2024-01-15T15:30:00Z',
        duration_minutes: 87,
        session_id: 1002,
        tutor_name: 'Dr. Sarah Johnson'
      },
      {
        task_id: 2004,
        task_name: 'Task 2.1P - Data Structures',
        project_id: 1004,
        student_name: 'Diana Prince',
        assessment_start: '2024-01-15T16:02:00Z',
        assessment_end: '2024-01-15T16:45:00Z',
        duration_minutes: 43,
        session_id: 1003,
        tutor_name: 'Prof. Michael Brown'
      },
      {
        task_id: 2005,
        task_name: 'Task 2.2C - Algorithms',
        project_id: 1005,
        student_name: 'Edward Norton',
        assessment_start: '2024-01-15T17:04:00Z',
        assessment_end: '2024-01-15T17:30:00Z',
        duration_minutes: 26,
        session_id: 1004,
        tutor_name: 'Dr. Emily Davis'
      },
      {
        task_id: 2006,
        task_name: 'Task 3.1P - Object-Oriented Programming',
        project_id: 1006,
        student_name: 'Fiona Gallagher',
        assessment_start: '2024-01-15T18:03:00Z',
        assessment_end: '2024-01-15T18:20:00Z',
        duration_minutes: 17,
        session_id: 1005,
        tutor_name: 'Dr. John Smith'
      },
      {
        task_id: 2007,
        task_name: 'Task 1.1P - Introduction to Programming',
        project_id: 1007,
        student_name: 'George Wilson',
        assessment_start: '2024-01-15T11:00:00Z',
        assessment_end: '2024-01-15T11:18:00Z',
        duration_minutes: 18,
        session_id: 1006,
        tutor_name: 'Dr. John Smith'
      },
      {
        task_id: 2008,
        task_name: 'Task 1.2C - Programming Concepts',
        project_id: 1008,
        student_name: 'Helen Parker',
        assessment_start: '2024-01-15T13:15:00Z',
        assessment_end: '2024-01-15T13:42:00Z',
        duration_minutes: 27,
        session_id: 1007,
        tutor_name: 'Dr. Sarah Johnson'
      }
    ];
  }

  private loadDummySessionAnalytics() {
    this.sessionAnalytics = {
      total_sessions: 23,
      active_sessions: 3,
      average_session_duration: 127,
      total_assessments: 156,
      average_assessment_time: 28.5,
      session_completion_rate: 0.87,
      most_active_tutors: [
        {
          tutor_name: 'Dr. John Smith',
          sessions_count: 8,
          total_time: 640
        },
        {
          tutor_name: 'Prof. Michael Brown',
          sessions_count: 6,
          total_time: 480
        },
        {
          tutor_name: 'Dr. Sarah Johnson',
          sessions_count: 5,
          total_time: 400
        },
        {
          tutor_name: 'Dr. Emily Davis',
          sessions_count: 3,
          total_time: 240
        },
        {
          tutor_name: 'Dr. Robert Wilson',
          sessions_count: 1,
          total_time: 80
        }
      ]
    };
  }

  onUnitChange() {
    if (this.selectedUnit && this.unitId) {
      this.loadMarkingSessionData();
    }
  }

  onSelect(event: unknown) {
    console.log('Chart selection:', event);
  }

  formatMinutesToHourMinute(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Get chart data for task times
  get taskTimesChartData() {
    return this._taskTimesChartData;
  }

  // Get chart data for tutor times (grouped by unit)
  get tutorTimesGroupedData() {
    return this._tutorTimesGroupedData;
  }

  // Check if user can see convenor data
  get canSeeConvenorData(): boolean {
    return this.unitRole === 'Convenor' || this.unitRole === 'Admin';
  }

  // Update chart data cache
  private updateChartDataCache() {
    this._dataVersion++;

    // Update task times chart data
    this._taskTimesChartData = this.taskTimesData.map(item => ({
      name: item.task_name,
      value: item.total_time_minutes
    }));

    // Update session activity data
    this._sessionActivityData = this.getSessionActivityChartData();

    // Update assessment trend data
    this._assessmentTrendData = this.getAssessmentTrendData();

    // Update tutor times grouped data
    if (this.unitRole === 'Convenor' || this.unitRole === 'Admin') {
      this._tutorTimesGroupedData = Object.entries(this.allUnitsTutorTimes).map(([unitCode, tutors]) => ({
        name: unitCode,
        series: tutors.map(tutor => ({
          name: tutor.tutor_name,
          value: tutor.total_duration_minutes
        }))
      }));
    } else {
      this._tutorTimesGroupedData = [];
    }
  }

  // Get session activity chart data
  private getSessionActivityChartData() {
    const activityCounts = this.sessionActivities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(activityCounts).map(([action, count]) => ({
      name: action,
      value: count
    }));
  }

  // Get assessment trend data
  private getAssessmentTrendData() {
    // Group assessments by date and calculate daily totals
    const dailyAssessments = this.assessmentDetails.reduce((acc, assessment) => {
      const date = new Date(assessment.assessment_start).toDateString();
      if (!acc[date]) {
        acc[date] = { assessments: 0, totalTime: 0 };
      }
      acc[date].assessments++;
      acc[date].totalTime += assessment.duration_minutes;
      return acc;
    }, {} as { [date: string]: { assessments: number; totalTime: number } });

    return [{
      name: 'Daily Assessments',
      series: Object.entries(dailyAssessments).map(([date, data]) => ({
        name: new Date(date).toLocaleDateString(),
        value: data.assessments
      }))
    }];
  }

  // Load additional data methods
  private loadMarkingSessions() {
    if (!this.unitId) return;
    this.loadDummyMarkingSessions();
  }

  private loadSessionActivities() {
    if (!this.unitId) return;
    this.loadDummySessionActivities();
  }

  private loadAssessmentDetails() {
    if (!this.unitId) return;
    this.loadDummyAssessmentDetails();
  }

  private loadSessionAnalytics() {
    if (!this.unitId) return;
    this.loadDummySessionAnalytics();
  }

  // Filter methods
  applyFilters() {
    this.loadMarkingSessionData();
  }

  clearFilters() {
    this.filterOptions = {};
    this.loadMarkingSessionData();
  }

  // Session management methods
  selectSession(sessionId: number) {
    this.selectedSessionId = sessionId;
    this.showSessionDetails = true;
  }

  closeSessionDetails() {
    this.selectedSessionId = undefined;
    this.showSessionDetails = false;
  }

  // Get active sessions (sessions within 15-minute threshold)
  getActiveSessions(): MarkingSession[] {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return this.markingSessions.filter(session =>
      new Date(session.updated_at) > fifteenMinutesAgo && !session.end_time
    );
  }

  // Get session activities for a specific session
  getSessionActivities(sessionId: number): SessionActivity[] {
    return this.sessionActivities.filter(activity => activity.marking_session_id === sessionId);
  }

  // Get assessments for a specific session
  getSessionAssessments(sessionId: number): AssessmentDetail[] {
    return this.assessmentDetails.filter(assessment => assessment.session_id === sessionId);
  }
}
