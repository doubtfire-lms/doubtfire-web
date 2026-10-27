import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription, combineLatest, of, switchMap} from 'rxjs';
import {NotificationFrequency} from 'src/app/api/models/notification';
import {NotificationSettings} from 'src/app/api/models/notification-settings';
import {Unit, isUnitRunning} from 'src/app/api/models/unit';
import {User} from 'src/app/api/models/user/user';
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
  styleUrl: './notification-settings.component.scss',
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
  public readonly digestIntervals = [1, 2, 3, 4, 6, 12];

  public loading = true;
  public saving = false;
  public selectedIndex = 0;

  /** Saved settings are laid over each scope once, so a cache refresh cannot undo edits. */
  private applied = false;

  /** Index 0 is always the "All units" scope. */
  public scopes: NotificationScope[] = [this.buildGlobalScope()];

  // One schedule for every unit, so activity that happened together stays together.
  public digestFrequency: NotificationFrequency = 'weekly';
  public digestIntervalHours = 4;
  public digestStartTime = '07:00';
  public digestEndTime = '22:00';
  public digestTime = '07:00';
  public digestWeekday = 1;

  public readonly browserTimezone = User.browserTimezone;
  public autoTimezone = true;
  public timezone = this.browserTimezone;

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
    const user = this.userService.currentUser;
    this.autoTimezone = user?.autoTimezone ?? true;
    this.timezone = (!this.autoTimezone && user?.timezone) || this.browserTimezone;

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

  /** Every IANA timezone, plus the current one in case the browser reports an alias. */
  public get timezones(): string[] {
    const zones = Intl.supportedValuesOf('timeZone');
    return zones.includes(this.timezone) ? zones : [this.timezone, ...zones];
  }

  public autoTimezoneChanged(checked: boolean): void {
    this.autoTimezone = checked;
    if (checked) {
      this.timezone = this.browserTimezone;
    }
  }

  public get hasUnits(): boolean {
    return this.scopes.length > 1;
  }

  public get sections(): NotificationSection[] {
    // Digest types are hidden while the digest is off, keeping their settings for when it is back on.
    return NOTIFICATION_SECTIONS.filter(
      (section) =>
        (section.audience === 'student' || this.isStaff) &&
        (section.delivery === 'alert' || this.digestFrequency !== 'off'),
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

  /** Reuses existing scopes so a cache refresh never discards the user's edits. */
  private syncScopes(units: Unit[]): void {
    const current: Map<number, Unit> = new Map();
    for (const unit of units) {
      if (isUnitRunning(unit) && !current.has(unit.id)) {
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
    this.saveTimezone()
      .pipe(switchMap(() => this.settingsService.save(this.currentSettings())))
      .subscribe({
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

  // Saved on the user first, so the digest schedule is rebuilt in the new timezone.
  private saveTimezone(): Observable<unknown> {
    const user = this.userService.currentUser;
    const unchanged =
      this.autoTimezone === (user?.autoTimezone ?? true) &&
      (this.autoTimezone || this.timezone === user?.timezone);
    if (unchanged) {
      return of(null);
    }
    return user.updateTimezone(this.timezone, this.autoTimezone);
  }

  private currentSettings(): NotificationSettings {
    const settings = this.saved ?? new NotificationSettings();
    // The API drops any unit left out, so units without a tab keep what they had.
    const shown = new Set(this.scopes.slice(1).map((scope) => scope.unitId));
    const unshown = settings.units.filter((unit) => !shown.has(unit.unitId));

    settings.channels = channelsToWire(this.scopes[0].channels);
    settings.digestFrequency = this.digestFrequency;
    settings.digestIntervalHours = this.digestIntervalHours;
    settings.digestStartTime = this.digestStartTime;
    settings.digestEndTime = this.digestEndTime;
    settings.digestTime = this.digestTime;
    settings.digestWeekday = this.digestWeekday;
    // Units following the defaults have nothing to store.
    settings.units = [
      ...this.scopes
        .slice(1)
        .filter((scope) => scope.muted || scope.customised)
        .map((scope) => ({
          unitId: scope.unitId,
          muted: scope.muted,
          channels: scope.customised ? channelsToWire(scope.channels) : undefined,
        })),
      ...unshown,
    ];

    return settings;
  }

  /** Lays the saved settings over the units currently on screen. */
  private rebuildScopes(): void {
    this.syncScopes(this.units);
    if (this.saved === undefined || this.applied) {
      return;
    }

    this.digestFrequency = this.saved.digestFrequency;
    this.digestIntervalHours = this.saved.digestIntervalHours;
    this.digestStartTime = this.saved.digestStartTime;
    this.digestEndTime = this.saved.digestEndTime;
    this.digestTime = this.saved.digestTime;
    this.digestWeekday = this.saved.digestWeekday;
    this.scopes[0].channels = channelsFromWire(this.saved.channels);

    for (const scope of this.scopes.slice(1)) {
      this.applySavedUnit(scope);
    }

    this.applied = true;
  }

  private applySavedUnit(scope: NotificationScope): void {
    const stored = this.saved?.units.find((unit) => unit.unitId === scope.unitId);
    scope.muted = stored?.muted ?? false;
    scope.customised = stored?.channels !== undefined;
    scope.channels = stored?.channels
      ? channelsFromWire(stored.channels)
      : cloneChannelSelection(this.scopes[0].channels);
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
    const scope: NotificationScope = {
      unitId: unit.id,
      code: unit.code,
      name: unit.name,
      customised: false,
      muted: false,
      channels: defaultChannelSelection(),
    };
    // A unit that loads after the settings still needs its stored override.
    if (this.applied) {
      this.applySavedUnit(scope);
    }
    return scope;
  }
}
