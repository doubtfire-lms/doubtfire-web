/**
 * The notification catalogue the settings screen renders from.
 *
 * Types are grouped by how they are delivered: `digest` types are high volume
 * and aggregable, so they are batched on the user's schedule; `alert` types are
 * low volume and each needs its own response, so they are never batched. Cadence
 * belongs to the type, not to a per-type setting.
 *
 * Alerts keep their own send rules - PDF failures go straight away, discussion
 * deadlines are raised by the 8am job, overseer failures wait out a grace period
 * and are dropped if the student reads them first - so that section has no single
 * `timing` line that would be true of all of them.
 */

export type NotificationChannel = 'inApp' | 'email' | 'push';

export type NotificationDelivery = 'digest' | 'alert';

export type NotificationAudience = 'student' | 'staff';

export interface NotificationTypeDefinition {
  /** Stable key used for storing channel preferences. */
  key: string;
  label: string;
  description: string;
}

export interface NotificationSection {
  key: string;
  title: string;
  /** When these reach the inbox. Only set where it is true of every type here. */
  timing?: string;
  delivery: NotificationDelivery;
  audience: NotificationAudience;
  types: NotificationTypeDefinition[];
}

export const NOTIFICATION_CHANNELS: {key: NotificationChannel; label: string; wire: string}[] = [
  {key: 'inApp', label: 'In app', wire: 'in_app'},
  {key: 'email', label: 'Email', wire: 'email'},
  {key: 'push', label: 'Push', wire: 'push'},
];

export const NOTIFICATION_SECTIONS: NotificationSection[] = [
  {
    key: 'activity',
    title: 'Feedback and marking',
    timing: 'Emailed in your digest',
    delivery: 'digest',
    audience: 'student',
    types: [
      {
        key: 'new_task_comment',
        label: 'New task comment',
        description: 'A tutor leaves feedback or replies on one of your tasks.',
      },
      {
        key: 'task_status_changed',
        label: 'Task status changed',
        description: 'A tutor marks one of your tasks or moves it to a new status.',
      },
    ],
  },
  {
    key: 'alerts',
    title: 'Alerts',
    delivery: 'alert',
    audience: 'student',
    types: [
      {
        key: 'overseer_failed',
        label: 'Overseer tests failed',
        description: 'Automated tests fail on one of your submissions.',
      },
      {
        key: 'pdf_generation_failed',
        label: 'PDF generation failed',
        description: 'A submission cannot be converted to a PDF.',
      },
      {
        key: 'discuss_warning',
        label: 'Deadline approaching',
        description: 'A task must be discussed with your tutor before its deadline.',
      },
      {
        key: 'discuss_expired',
        label: 'Deadline missed',
        description: 'A task moves to Fix and Resubmit after its discussion deadline passes.',
      },
    ],
  },
  {
    key: 'portfolio',
    title: 'Portfolio',
    delivery: 'alert',
    audience: 'student',
    types: [
      {
        key: 'portfolio_ready',
        label: 'Portfolio ready',
        description: 'Your compiled portfolio is ready to review.',
      },
      {
        key: 'portfolio_failed',
        label: 'Portfolio compilation failed',
        description: 'Your portfolio could not be compiled.',
      },
    ],
  },
  {
    key: 'moderation',
    title: 'Moderation notes',
    delivery: 'alert',
    audience: 'staff',
    types: [
      {
        key: 'moderation_note_added',
        label: 'Moderation note added',
        description: 'A staff member leaves a moderation note for you.',
      },
      {
        key: 'moderation_note_reply',
        label: 'Moderation note reply',
        description: 'A staff member replies to one of your moderation notes.',
      },
      {
        key: 'moderation_note_from_mentee',
        label: 'Note from staff you mentor',
        description: 'A staff member you mentor adds a moderation note.',
      },
    ],
  },
];

/** Channels a type is switched on for, keyed by notification type. */
export type ChannelSelection = Record<string, Record<NotificationChannel, boolean>>;

export function defaultChannelSelection(): ChannelSelection {
  const selection: ChannelSelection = {};
  for (const section of NOTIFICATION_SECTIONS) {
    for (const type of section.types) {
      selection[type.key] = {inApp: true, email: true, push: false};
    }
  }
  return selection;
}

/** The API stores the enabled channels per kind, e.g. { new_task_comment: ['in_app'] }. */
export type WireChannels = Record<string, string[]>;

export function channelsToWire(selection: ChannelSelection): WireChannels {
  const wire: WireChannels = {};
  for (const [key, channels] of Object.entries(selection)) {
    wire[key] = NOTIFICATION_CHANNELS.filter((channel) => channels[channel.key]).map(
      (channel) => channel.wire,
    );
  }
  return wire;
}

export function channelsFromWire(wire: WireChannels): ChannelSelection {
  const selection = defaultChannelSelection();
  for (const key of Object.keys(selection)) {
    const enabled = wire[key] ?? [];
    for (const channel of NOTIFICATION_CHANNELS) {
      selection[key][channel.key] = enabled.includes(channel.wire);
    }
  }
  return selection;
}

export function cloneChannelSelection(selection: ChannelSelection): ChannelSelection {
  const copy: ChannelSelection = {};
  for (const [key, channels] of Object.entries(selection)) {
    copy[key] = {...channels};
  }
  return copy;
}
