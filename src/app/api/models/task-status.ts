import { Task } from './task';

export type TaskStatusEnum =
  | 'not_started'
  | 'feedback_exceeded'
  | 'redo'
  | 'need_help'
  | 'working_on_it'
  | 'fix_and_resubmit'
  | 'ready_for_feedback'
  | 'discuss'
  | 'demonstrate'
  | 'complete'
  | 'fail'
  | 'time_exceeded';

export type TaskStatusUiData = {
  status: TaskStatusEnum;
  icon: string;
  label: string;
  class: string;
  help: { detail: string; reason: string; action: string };
};

export class TaskStatus {
  public static readonly STATUS_KEYS: TaskStatusEnum[] = [
    'not_started',
    'feedback_exceeded',
    'redo',
    'need_help',
    'working_on_it',
    'fix_and_resubmit',
    'ready_for_feedback',
    'discuss',
    'demonstrate',
    'complete',
    'fail',
    'time_exceeded',
  ];

  public static readonly VALID_TOP_TASKS: TaskStatusEnum[] = [
    'not_started',
    'redo',
    'need_help',
    'working_on_it',
    'fix_and_resubmit',
    'ready_for_feedback',
    'discuss',
    'demonstrate',
  ];

  public static readonly SUBMITTED_STATUSES: TaskStatusEnum[] = [
    'feedback_exceeded',
    'ready_for_feedback',
    'discuss',
    'demonstrate',
    'complete',
    'fail',
    'time_exceeded',
  ];

  public static readonly FINAL_STATUSES: TaskStatusEnum[] = ['complete', 'fail', 'feedback_exceeded', 'time_exceeded'];

  public static readonly GRADEABLE_STATUSES: TaskStatusEnum[] = ['fail', 'discuss', 'demonstrate', 'complete'];

  public static readonly TO_BE_WORKED_ON: TaskStatusEnum[] = ['not_started', 'redo', 'need_help', 'working_on_it'];

  public static readonly DISCUSSION_STATES: TaskStatusEnum[] = ['discuss', 'demonstrate'];

  public static readonly STATE_THAT_ALLOWS_EXTENSION: TaskStatusEnum[] = [
    'not_started',
    'redo',
    'need_help',
    'working_on_it',
    'fix_and_resubmit',
    'ready_for_feedback',
    'time_exceeded',
  ];

  public static readonly PDF_REGENERATABLE_STATES: TaskStatusEnum[] = [
    'demonstrate',
    'ready_for_feedback',
    'discuss',
    'complete',
    'time_exceeded',
    'fail',
    'fix_and_resubmit',
    'feedback_exceeded',
    'redo',
  ];

  public static readonly SUBMITTABLE_STATUSES: TaskStatusEnum[] = ['ready_for_feedback', 'need_help'];

  public static readonly MARKED_STATUSES: TaskStatusEnum[] = [
    'redo',
    'fail',
    'fix_and_resubmit',
    'feedback_exceeded',
    'discuss',
    'demonstrate',
    'complete',
  ];

  public static readonly LEARNING_WEIGHT: Map<TaskStatusEnum, number> = new Map<TaskStatusEnum, number>([
    ['fail', 0.0],
    ['not_started', 0.0],
    ['working_on_it', 0.0],
    ['need_help', 0.0],
    ['redo', 0.1],
    ['feedback_exceeded', 0.1],
    ['fix_and_resubmit', 0.3],
    ['ready_for_feedback', 0.5],
    ['discuss', 0.8],
    ['demonstrate', 0.8],
    ['complete', 1.0],
    ['time_exceeded', 0.3],
  ]);

  public static readonly STATUS_ACRONYM: Map<TaskStatusEnum, string> = new Map<TaskStatusEnum, string>([
    ['ready_for_feedback', 'RFF'],
    ['not_started', 'NOS'],
    ['working_on_it', 'WRK'],
    ['need_help', 'HLP'],
    ['redo', 'RDO'],
    ['feedback_exceeded', 'DNR'],
    ['fix_and_resubmit', 'FIX'],
    ['discuss', 'DIS'],
    ['demonstrate', 'DEM'],
    ['complete', 'COM'],
    ['fail', 'FAL'],
    ['time_exceeded', 'TIE'],
  ]);

  // Which status should not show up in the task status drop down... for students
  public static readonly REJECT_FUTURE_STATES: Map<TaskStatusEnum, TaskStatusEnum[]> = new Map<
    TaskStatusEnum,
    TaskStatusEnum[]
  >([
    ['not_started', []],
    ['working_on_it', []],
    ['need_help', []],
    ['ready_for_feedback', []],
    ['complete', ['ready_for_feedback', 'not_started', 'working_on_it', 'need_help']],
    ['discuss', ['ready_for_feedback', 'not_started', 'working_on_it', 'need_help']],
    ['demonstrate', ['ready_for_feedback', 'not_started', 'working_on_it', 'need_help']],
    ['fix_and_resubmit', []],
    ['redo', []],
    ['feedback_exceeded', ['ready_for_feedback', 'not_started', 'working_on_it', 'need_help']],
    ['time_exceeded', ['ready_for_feedback', 'not_started', 'working_on_it', 'need_help']],
    ['fail', ['ready_for_feedback', 'not_started', 'working_on_it', 'need_help']],
  ]);

  public static readonly STATUS_LABELS = new Map<TaskStatusEnum, string>([
    ['ready_for_feedback', 'Awaiting Feedback'],
    ['not_started', 'Not Started'],
    ['working_on_it', 'Working On It'],
    ['need_help', 'Need Help'],
    ['redo', 'Redo'],
    ['feedback_exceeded', 'Feedback Exceeded'],
    ['fix_and_resubmit', 'Resubmit'],
    ['discuss', 'Discuss'],
    ['demonstrate', 'Demonstrate'],
    ['complete', 'Complete'],
    ['fail', 'Fail'],
    ['time_exceeded', 'Time Exceeded'],
  ]);

  public static readonly STATUS_NAME_TO_KEY = new Map<string, TaskStatusEnum>([
    ['Ready for Feedback', 'ready_for_feedback'],
    ['Awaiting Feedback', 'ready_for_feedback'],
    ['Not Started', 'not_started'],
    ['Working On It', 'working_on_it'],
    ['Need Help', 'need_help'],
    ['Redo', 'redo'],
    ['Feedback Exceeded', 'feedback_exceeded'],
    ['Resubmit', 'fix_and_resubmit'],
    ['Discuss', 'discuss'],
    ['Demonstrate', 'demonstrate'],
    ['Complete', 'complete'],
    ['Fail', 'fail'],
    ['Time Exceeded', 'time_exceeded'],
  ]);

  public static readonly STATUS_ICONS = new Map<TaskStatusEnum, string>([
    ['ready_for_feedback', 'fa fa-thumbs-o-up'],
    ['not_started', 'fa fa-pause'],
    ['working_on_it', 'fa fa-bolt'],
    ['need_help', 'fa fa-question-circle'],
    ['redo', 'fa fa-refresh'],
    ['feedback_exceeded', 'fa fa-low-vision'],
    ['fix_and_resubmit', 'fa fa-wrench'],
    ['discuss', 'fa fa-commenting'],
    ['demonstrate', 'fa fa-commenting'],
    ['complete', 'fa fa-check'],
    ['fail', 'fa fa-times'],
    ['time_exceeded', 'fa fa-clock-o'],
  ]);

  // Please make sure this matches task-status-colors.less
  public static readonly STATUS_COLORS = new Map<TaskStatusEnum, string>([
    ['ready_for_feedback', '#0079D8'],
    ['not_started', '#CCCCCC'],
    ['working_on_it', '#EB8F06'],
    ['need_help', '#a48fce'],
    ['fix_and_resubmit', '#f2d85c'],
    ['feedback_exceeded', '#d46b54'],
    ['redo', '#804000'],
    ['discuss', '#31b0d5'],
    ['demonstrate', '#428bca'],
    ['complete', '#5BB75B'],
    ['fail', '#d93713'],
    ['time_exceeded', '#d93713'],
  ]);

  public static readonly STATUS_SEQ = new Map<TaskStatusEnum, number>([
    ['not_started', 1],
    ['fail', 2],
    ['feedback_exceeded', 3],
    ['time_exceeded', 4],
    ['redo', 5],
    ['need_help', 6],
    ['working_on_it', 7],
    ['ready_for_feedback', 8],
    ['fix_and_resubmit', 9],
    ['discuss', 10],
    ['demonstrate', 11],
    ['complete', 12],
  ]);

  public static readonly SWITCHABLE_STATES = {
    student: ['not_started', 'working_on_it', 'need_help', 'ready_for_feedback'],
    tutor: ['complete', 'discuss', 'demonstrate', 'fix_and_resubmit', 'redo', 'feedback_exceeded', 'fail'],
  };

  // detail = in a brief context to the student
  // reason = reason for this status
  // action = action student can take
  public static readonly HELP_DESCRIPTIONS = new Map<
    TaskStatusEnum,
    { detail: string; reason: string; action: string }
  >([
    [
      'ready_for_feedback',
      {
        detail: 'Submitted this task for feedback',
        reason: 'You have finished working on the task and have uploaded it for your tutor to assess.',
        action: 'No further action is required. Your tutor will change this task status once they have assessed it.',
      },
    ],
    [
      'not_started',
      {
        detail: 'Task not started',
        reason: 'You have not yet started the Task.',
        action: 'Depending on when the target date is, you should start this task soon.',
      },
    ],
    [
      'working_on_it',
      {
        detail: 'Working on the task',
        reason: 'You are working on the task, but it is not yet ready to assess.',
        action: 'Finish working on this task and then set it to ready for feedback.',
      },
    ],
    [
      'need_help',
      {
        detail: 'Need help for the task',
        reason: 'You are working on the task but would like some help to get it complete.',
        action: 'Upload the task with what you have completed so far and add a comment on what you would like help on.',
      },
    ],
    [
      'redo',
      {
        detail: 'Start this task from scratch',
        reason:
          'You appeared to have misunderstood what is required for this task, many deliverables were missing or the marking criteria was largely not met.',
        action:
          'You should reconsider your approach to this task. Review the task resources and task guide instructions. Check the deliverables carefully. Consider getting help from your tutor and/or lecturer.',
      },
    ],
    [
      'feedback_exceeded',
      {
        detail: 'Feedback will no longer be given',
        reason: 'This work is not complete to an acceptable standard and your tutor will not reassess it again.',
        action:
          "It is now your responsibility to ensure this task is at an adequate standard in your portfolio. You should fix your work according to your tutor's prior feedback and include a corrected version in your portfolio.",
      },
    ],
    [
      'fix_and_resubmit',
      {
        detail: 'Your submission requires some more work',
        reason:
          'It looks like your work is on the right track, but it does require some extra work to achieve the required standard.',
        action:
          'Review your submission and the feedback from your tutor. Fix the issues identified, and resubmit it to be reassessed. Make sure to check your submission thoroughly, and note any limit on the number of times each task can be reassessed.',
      },
    ],
    [
      'discuss',
      {
        detail: 'Your work needs to be discussed further.',
        reason: 'Your work looks good and your tutor believes it is on track.',
        action: 'For this to be marked as complete, attend class and discuss it with your tutor.',
      },
    ],
    [
      'demonstrate',
      {
        detail: 'Your work needs to be demonstrated.',
        reason: 'Your work looks good and your tutor believes it is on track.',
        action:
          'For this to be marked as complete you need to attend class and demonstrate how your submission works for your tutor.',
      },
    ],
    [
      'complete',
      {
        detail: 'You are finished with this task 🎉',
        reason: 'Your tutor is happy with your work and it has been discussed with them.',
        action: 'No further action required. Move onto the next task, or go party if everything is done.',
      },
    ],
    [
      'fail',
      {
        detail: 'You have failed this task',
        reason:
          'You have not successfully demonstrated the required learning for this task. This may be due to plagiarism detection or assessment under testing conditions.',
        action: 'You should discuss this with your tutor and/or the convenor.',
      },
    ],
    [
      'time_exceeded',
      {
        detail: 'Time limit exceeded',
        reason: 'This work was submitted after the deadline, having missed both the target date and deadline.',
        action:
          'Work submitted after the feedback deadline will not be checked by tutors prior to the portfolio assessment. You will need to ensure this task is at an adequate standard in your portfolio.',
      },
    ],
    // [
    //   "awaiting_extension",
    //   {
    //     detail: "Time limit exceeded, awaiting extension",
    //     reason: "This work was submitted after the deadline, having missed both the target date and deadline but is awaiting an extension.",
    //     action: "You require an extension to have this work assessed. If an extension is granted the task will be ready for feedback, and will be reviewed by your tutor."
    //   }
    // ]
  ]);

  public static statusData(data: Task | TaskStatusEnum): TaskStatusUiData {
    // provided a task not a status
    const status = typeof data !== 'string' ? data.status : data;
    return {
      status: status,
      icon: TaskStatus.STATUS_ICONS.get(status),
      label: TaskStatus.STATUS_LABELS.get(status),
      class: TaskStatus.statusClass(status),
      help: TaskStatus.HELP_DESCRIPTIONS.get(status),
    };
  }

  public static statusClass(status: TaskStatusEnum | undefined): string {
    return status?.replace(new RegExp('_', 'g'), '-');
  }
}
