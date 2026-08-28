import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, combineLatest} from 'rxjs';
import {NotificationFrequency} from 'src/app/api/models/notification';
import {NotificationSettings} from 'src/app/api/models/notification-settings';
import {Unit} from 'src/app/api/models/unit';
import {NotificationSettingsService} from 'src/app/api/services/notification-settings.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {
  ChannelSelection,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SECTIONS,
  NotificationChannel,
  NotificationSection,
  channelsFromWire,
  channelsToWire,
  cloneChannelSelection,
  defaultChannelSelection,
} from './notification-types';

/** One tab's worth of settings. A null `unitId` is the "All units" default. */
export interface NotificationScope {
  unitId: number | null;
  code: string;
  name: string;
  /** When false the scope follows the "All units" defaults. */
  customised: boolean;
  muted: boolean;
  channels: ChannelSelection;
}

@Component({
  selector: 'f-notification-settings',
  templateUrl: './notification-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  // TODO: Show the Push column when push notifications are supported by the client.
  public readonly channels = NOTIFICATION_CHANNELS.filter((channel) => channel.key !== 'push');
  public readonly weekdays = [
    {value: 1, label: 'Monday'},
    {value: 2, label: 'Tuesday'},
    {value: 3, label: 'Wednesday'},
    {value: 4, label: 'Thursday'},
    {value: 5, label: 'Friday'},
    {value: 6, label: 'Saturday'},
    {value: 7, label: 'Sunday'},
  ];

  public loading = true;
  public saving = false;
  public selectedIndex = 0;

  /** Saved settings are laid over the scopes once, so a cache refresh cannot undo edits. */
  private applied = false;

  /** Index 0 is always the "All units" scope. */
  public scopes: NotificationScope[] = [this.buildGlobalScope()];

  // One schedule for every unit, so activity that happened together stays together.
  public digestFrequency: NotificationFrequency = 'weekly';
  public digestTime = '07:00';
  public digestWeekday = 1;
  public weeklySummary = true;

  private readonly subscriptions: Subscription[] = [];

  private units: Unit[] = [];
  private saved?: NotificationSettings;

  constructor(
    private globalState: GlobalStateService,
    private settingsService: NotificationSettingsService,
    private userService: UserService,
    private alerts: AlertService,
  ) {}

  public ngOnInit(): void {
    // Units taught and units studied - the same set the header's unit picker uses.
    this.subscriptions.push(
      combineLatest([
        this.globalState.unitRolesSubject,
        this.globalState.projectsSubject,
      ]).subscribe(([unitRoles, projects]) => {
        this.units = [
          ...(unitRoles ?? []).map((unitRole) => unitRole.unit),
          ...(projects ?? []).map((project) => project.unit),
        ];
        this.rebuildScopes();
      }),
    );

    this.settingsService.load().subscribe({
      next: (settings) => {
        this.saved = settings;
        this.rebuildScopes();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alerts.error('Unable to load your notification settings', 5000);
      },
    });
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  public get hasUnits(): boolean {
    return this.scopes.length > 1;
  }

  public get sections(): NotificationSection[] {
    return NOTIFICATION_SECTIONS.filter(
      (section) => section.audience === 'student' || this.isStaff,
    );
  }

  public get isStaff(): boolean {
    return this.userService.currentUser?.isStaff ?? false;
  }

  public get currentScope(): NotificationScope {
    return this.scopes[this.selectedIndex] ?? this.scopes[0];
  }

  public get isGlobalScope(): boolean {
    return this.currentScope.unitId === null;
  }

  /** Whether this tab owns its settings, rather than following "All units". */
  public get isEditable(): boolean {
    return this.isGlobalScope || this.currentScope.customised;
  }

  /** Sections only appear where there is something to edit, never disabled. */
  public get showsSections(): boolean {
    if (this.currentScope.muted) {
      return false;
    }

    return this.isEditable;
  }

  /** The inherit/customise banner is moot while a unit is muted. */
  public get showsInheritanceBanner(): boolean {
    return !this.isGlobalScope && !this.currentScope.muted;
  }

  public isChecked(typeKey: string, channel: NotificationChannel): boolean {
    return this.currentScope.channels[typeKey]?.[channel] ?? false;
  }

  public setChannel(typeKey: string, channel: NotificationChannel, checked: boolean): void {
    if (!this.isEditable) {
      return;
    }

    this.currentScope.channels[typeKey][channel] = checked;
  }

  /** Stop following "All units" and start from a copy of its current values. */
  public customise(): void {
    const scope = this.currentScope;
    scope.channels = cloneChannelSelection(this.scopes[0].channels);
    scope.customised = true;
  }

  public resetToGlobal(): void {
    const scope = this.currentScope;
    scope.channels = cloneChannelSelection(this.scopes[0].channels);
    scope.customised = false;
  }

  /** Muting is independent of customising, so unmuting restores what was there. */
  public muteChanged(muted: boolean): void {
    this.currentScope.muted = muted;
  }

  /** Running units only: active, and today inside their dates. */
  private isCurrent(unit: Unit): boolean {
    if (!unit?.active) {
      return false;
    }

    if (!unit.startDate || !unit.endDate) {
      return unit.isActive;
    }

    const today = new Date();
    return unit.startDate <= today && today <= unit.endDate;
  }

  /** Reuses existing scopes so a cache refresh never discards the user's edits. */
  private syncScopes(units: Unit[]): void {
    const current: Map<number, Unit> = new Map();
    for (const unit of units) {
      if (this.isCurrent(unit) && !current.has(unit.id)) {
        current.set(unit.id, unit);
      }
    }

    const existing = new Map(this.scopes.slice(1).map((scope) => [scope.unitId, scope]));
    const unitScopes = [...current.values()]
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((unit) => existing.get(unit.id) ?? this.buildUnitScope(unit));

    this.scopes = [this.scopes[0], ...unitScopes];
    this.selectedIndex = Math.min(this.selectedIndex, this.scopes.length - 1);
  }

  public save(): void {
    this.saving = true;
    this.settingsService.save(this.currentSettings()).subscribe({
      next: () => {
        this.saving = false;
        this.alerts.success('Notification settings saved', 3000);
      },
      error: () => {
        this.saving = false;
        this.alerts.error('Unable to save your notification settings', 5000);
      },
    });
  }

  private currentSettings(): NotificationSettings {
    const settings = this.saved ?? new NotificationSettings();

    settings.channels = channelsToWire(this.scopes[0].channels);
    settings.digestFrequency = this.digestFrequency;
    settings.digestTime = this.digestTime;
    settings.digestWeekday = this.digestWeekday;
    settings.weeklySummary = this.weeklySummary;
    // Units following the defaults have nothing to store.
    settings.units = this.scopes
      .slice(1)
      .filter((scope) => scope.muted || scope.customised)
      .map((scope) => ({
        unitId: scope.unitId,
        muted: scope.muted,
        channels: scope.customised ? channelsToWire(scope.channels) : undefined,
      }));

    return settings;
  }

  /** Lays the saved settings over the units currently on screen. */
  private rebuildScopes(): void {
    this.syncScopes(this.units);
    if (this.saved === undefined || this.applied) {
      return;
    }

    this.digestFrequency = this.saved.digestFrequency;
    this.digestTime = this.saved.digestTime;
    this.digestWeekday = this.saved.digestWeekday;
    this.weeklySummary = this.saved.weeklySummary;
    this.scopes[0].channels = channelsFromWire(this.saved.channels);

    for (const scope of this.scopes.slice(1)) {
      const stored = this.saved.units.find((unit) => unit.unitId === scope.unitId);
      scope.muted = stored?.muted ?? false;
      scope.customised = stored?.channels !== undefined;
      scope.channels = stored?.channels
        ? channelsFromWire(stored.channels)
        : cloneChannelSelection(this.scopes[0].channels);
    }

    this.applied = true;
  }

  private buildGlobalScope(): NotificationScope {
    return {
      unitId: null,
      code: 'All units',
      name: 'Defaults for every unit',
      customised: true,
      muted: false,
      channels: defaultChannelSelection(),
    };
  }

  private buildUnitScope(unit: Unit): NotificationScope {
    return {
      unitId: unit.id,
      code: unit.code,
      name: unit.name,
      customised: false,
      muted: false,
      channels: defaultChannelSelection(),
    };
  }
}
