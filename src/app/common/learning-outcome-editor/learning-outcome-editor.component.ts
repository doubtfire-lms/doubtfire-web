import {
  AfterViewInit,
  Component,
  computed,
  inject,
  Inject,
  Input,
  model,
  OnDestroy,
  signal,
  effect,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {
  TaskDefinition,
  Unit,
  LearningOutcome,
  LearningOutcomeService,
  TaskService,
} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {MatSort, Sort} from '@angular/material/sort';
import {
  confirmationModal,
  csvResultModalService,
  csvUploadModalService,
} from 'src/app/ajs-upgraded-providers';
import {Subscription} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';
import {isEqual} from 'lodash';
import {NestedCsvDownloadModalService} from './nested-csv-download-modal/nested-csv-download-modal.service';
import API_URL from 'src/app/config/constants/apiURL';

@Component({
  selector: 'f-learning-outcome-editor',
  templateUrl: 'learning-outcome-editor.component.html',
})
export class LearningOutcomeEditorComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() context?: TaskDefinition | Unit;

  @ViewChild('outcomeTable', {static: false}) outcomeTable: MatTable<LearningOutcome>;
  @ViewChild(MatSort, {static: false}) outcomeSort: MatSort;
  @ViewChild(MatPaginator, {static: false}) outcomePaginator: MatPaginator;

  public outcomeSource: MatTableDataSource<LearningOutcome>;
  public outcomeColumns: string[] = [
    'abbreviation',
    'shortDescription',
    'fullOutcomeDescription',
    'connectedOutcomes',
    'learningOutcomeAction',
  ];
  public selectedOutcome: LearningOutcome;
  public abbreviationPrefix: 'TLO' | 'ULO' | 'GLO';

  public allOutcomes: LearningOutcome[] = [];
  public selectedConnectedOutcomes = signal([]);

  private subscriptions: Subscription[] = [];

  constructor(
    private alerts: AlertService,
    private learningOutcomeService: LearningOutcomeService,
    private fileDownloaderService: FileDownloaderService,
    private nestedCsvDownloadModalService: NestedCsvDownloadModalService,
    private taskService: TaskService,
    @Inject(csvResultModalService) private csvResultModalService: any,
    @Inject(csvUploadModalService) private csvUploadModal: any,
    @Inject(confirmationModal) private confirmationModal: any,
  ) {
    effect(() => {
      const linkedOutcomes = this.selectedConnectedOutcomes().map((outcome) => outcome.id);
      if (
        this.selectedOutcome &&
        !isEqual(linkedOutcomes.sort(), this.selectedOutcome.linkedOutcomeIds.sort())
      )
        this.selectedOutcome.linkedOutcomeIds = linkedOutcomes;
    });
  }

  ngAfterViewInit(): void {
    this.setAbbreviationPrefix();

    if (!this.context) {
      this.subscriptions.push(
        this.learningOutcomeService.cache.values.subscribe((outcomes) => {
          const glos = outcomes.filter((outcome) => outcome.contextType === null);
          this.initialiseTable(glos);
        }),
      );
      return;
    }

    this.subscriptions.push(
      this.context.learningOutcomesCache.values.subscribe((learningOutcomes) => {
        this.initialiseTable(learningOutcomes);
      }),
    );

    this.subscriptions.push(
      this.learningOutcomeService.cache.values.subscribe((outcomes) => {
        const glos = outcomes.filter((outcome) => outcome.contextType === null);
        this.allOutcomes = [...this.allOutcomes, ...glos];
      }),
    );

    if (this.context instanceof TaskDefinition) {
      this.subscriptions.push(
        this.context.unit.learningOutcomesCache.values.subscribe((learningOutcomes) => {
          this.allOutcomes = [...this.allOutcomes, ...learningOutcomes];
        }),
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setAbbreviationPrefix();

    this.subscriptions.push(
      this.context.learningOutcomesCache.values.subscribe((learningOutcomes) => {
        this.initialiseTable(learningOutcomes);
      }),
    );

    this.selectedOutcome = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  setAbbreviationPrefix(): void {
    if (!this.context) this.abbreviationPrefix = 'GLO';
    else if (this.context instanceof TaskDefinition) this.abbreviationPrefix = 'TLO';
    else if (this.context instanceof Unit) this.abbreviationPrefix = 'ULO';
  }

  initialiseTable(learningOutcomes: LearningOutcome[]) {
    this.outcomeSource = new MatTableDataSource<LearningOutcome>(learningOutcomes);
    this.outcomeSource.paginator = this.outcomePaginator;
    this.outcomeSource.sort = this.outcomeSort;
    this.outcomeSource.filterPredicate = (data: LearningOutcome, filter: string) => {
      const filterValue = filter.trim().toLowerCase();
      return (
        data.abbreviation.toLowerCase().includes(filterValue) ||
        data.shortDescription.toLowerCase().includes(filterValue) ||
        data.fullOutcomeDescription.toLowerCase().includes(filterValue)
      );
    };
  }

  public saveLearningOutcome(learningOutcome: LearningOutcome) {
    if (
      !learningOutcome.abbreviation.trim() ||
      !learningOutcome.shortDescription.trim() ||
      !learningOutcome.fullOutcomeDescription.trim()
    ) {
      this.alerts.error('Failed to save learning outcome. Fill in required fields.');
      return;
    }
    learningOutcome.save().subscribe({
      next: () => {
        this.alerts.success('Outcome saved');
        learningOutcome.setOriginalSaveData(this.learningOutcomeService.mapping);
        this.selectLearningOutcome(this.selectedOutcome);
      },
      error: () => this.alerts.error('Failed to save learning outcome. Please try again.'),
    });
  }

  public selectLearningOutcome(learningOutcome: LearningOutcome) {
    if (this.selectedOutcome === learningOutcome) {
      this.selectedOutcome = null;
      this.selectedConnectedOutcomes.update((_selectedConnectedOutcomes) => []);
    } else {
      this.selectedOutcome = learningOutcome;
      this.selectedConnectedOutcomes.update(() => this.getLinkedOutcomes(learningOutcome));
      if (!this.selectedOutcome.context) this.selectedOutcome.context = this.context;

      if (!this.selectedOutcome.hasOriginalSaveData) {
        this.selectedOutcome.setOriginalSaveData(this.learningOutcomeService.mapping);
      }
    }
  }

  public sortOutcomeData(sort: Sort) {
    const data = this.outcomeSource.data;

    if (!sort.active || sort.direction === '') {
      this.outcomeSource.data = data;
      return;
    }

    this.outcomeSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'abbreviation':
          return this.compare(a.abbreviation, b.abbreviation, isAsc);
        case 'shortDescription':
          return this.compare(a.shortDescription, b.shortDescription, isAsc);
        case 'fullOutcomeDescription':
          return this.compare(a.fullOutcomeDescription, b.fullOutcomeDescription, isAsc);
        default:
          return 0;
      }
    });
  }

  public compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  applyFilter(filterValue: string) {
    this.outcomeSource.filter = filterValue;
    if (this.outcomeSource.paginator) {
      this.outcomeSource.paginator.firstPage();
    }
  }

  public learningOutcomeHasChanges(learningOutcome: LearningOutcome): boolean {
    return learningOutcome.hasChanges(this.learningOutcomeService.mapping);
  }

  public deleteLearningOutcome(learningOutcome: LearningOutcome) {
    this.confirmationModal.show(
      'Delete learning outcome',
      'Are you sure you want to delete this outcome? This action is final.',
      () => {
        learningOutcome.delete().subscribe({
          next: () => {
            this.alerts.success('Learning outcome deleted');
            if (this.selectedOutcome === learningOutcome)
              this.selectLearningOutcome(this.selectedOutcome);
          },
          error: () => this.alerts.error('Failed to delete learning outcome. Please try again.'),
        });
      },
    );
  }

  public uploadCsv(type: 'Learning Outcomes' | 'Feedback Templates') {
    let url: string;

    if (type === 'Learning Outcomes') url = this.context.getOutcomeBatchUploadUrl();
    else {
      if (this.context) url = this.context.getFeedbackTemplateBatchUploadUrl();
      else url = `${API_URL}/global/feedback_chips/csv`;
    }

    this.csvUploadModal.show(
      `Upload ${type} as CSV`,
      'Test message',
      {file: {name: `${type} CSV Data`, type: 'csv'}},
      url,
      (response: any) => {
        this.csvResultModalService.show(`${type} CSV Upload Results`, response);
        if (response.success.length > 0) {
          this.context.refresh();
        }
      },
    );
  }

  public downloadCsv(type: 'Learning Outcomes' | 'Feedback Templates') {
    let url: string;

    if (type === 'Learning Outcomes') url = this.context.getOutcomeBatchUploadUrl();
    else {
      if (this.context) url = this.context.getFeedbackTemplateBatchUploadUrl();
      else url = `${API_URL}/global/feedback_chips/csv`;
    }

    let name = `${type}.csv`;

    if (this.context instanceof TaskDefinition)
      name = `${this.context.unit.code}-${this.context.abbreviation}-${name}`;
    else if (this.context instanceof Unit) name = `${this.context.code}-${name}`;

    if (this.context instanceof Unit) this.nestedCsvDownloadModalService.show(url, name, type);
    else this.fileDownloaderService.downloadFile(url, name);
  }

  public createLearningOutcome() {
    const learningOutcome = new LearningOutcome();

    if (this.context) {
      learningOutcome.context = this.context;
      if (this.context instanceof TaskDefinition) learningOutcome.contextType = 'TaskDefinition';
      else if (this.context instanceof Unit) learningOutcome.contextType = 'Unit';
      learningOutcome.contextId = this.context.id;
    }
    learningOutcome.abbreviation = this.abbreviationPrefix + String(this.getNextOutcomeNumber());
    learningOutcome.shortDescription = '';
    learningOutcome.fullOutcomeDescription = '';
    this.selectedConnectedOutcomes.update((_selectedConnectedOutcomes) => []);

    this.selectedOutcome = learningOutcome;
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly typedConnectedOutcome = model('');
  readonly filteredOutcomes = computed(() => {
    const currentOutcome = this.typedConnectedOutcome().toLowerCase();
    return this.allOutcomes.filter((outcome) => {
      const abbreviation = outcome.abbreviation?.toLowerCase();
      return (
        !this.selectedConnectedOutcomes().includes(outcome) &&
        (!currentOutcome || abbreviation?.includes(currentOutcome))
      );
    });
  });

  readonly announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      const outcome = this.allOutcomes.find(
        (o) => o.abbreviation?.toLowerCase() === value.toLowerCase(),
      );
      if (outcome && !this.selectedConnectedOutcomes().includes(outcome)) {
        this.selectedConnectedOutcomes.update((selectedConnectedOutcomes) => [
          ...selectedConnectedOutcomes,
          outcome,
        ]);
      }
    }

    this.typedConnectedOutcome.set('');
  }

  remove(outcome: LearningOutcome): void {
    this.selectedConnectedOutcomes.update((selectedConnectedOutcomes) => {
      const updatedOutcomes = selectedConnectedOutcomes.filter(
        (o) => o.abbreviation !== outcome.abbreviation,
      );
      this.announcer.announce(`Removed ${outcome.abbreviation}`);
      return updatedOutcomes;
    });
  }

  select(event: MatAutocompleteSelectedEvent): void {
    const outcome = this.allOutcomes.find(
      (o) => o.abbreviation === event.option.viewValue.split(' - ')[0],
    );

    if (outcome && !this.selectedConnectedOutcomes().includes(outcome)) {
      this.selectedConnectedOutcomes.update((selectedConnectedOutcomes) => [
        ...selectedConnectedOutcomes,
        outcome,
      ]);
    }

    this.typedConnectedOutcome.set('');
    event.option.deselect();
  }

  getLinkedOutcomes(learningOutcome: LearningOutcome): LearningOutcome[] {
    return this.allOutcomes.filter((outcome) =>
      learningOutcome.linkedOutcomeIds.includes(outcome.id),
    );
  }

  getNextOutcomeNumber(): number {
    if (this.outcomeSource.data && this.outcomeSource.data.length > 0) {
      let abbr = this.outcomeSource.data[this.outcomeSource.data.length - 1].abbreviation;
      abbr = abbr.replace(this.abbreviationPrefix, '');
      return Number(abbr) + 1;
    }
    return 1;
  }
}
