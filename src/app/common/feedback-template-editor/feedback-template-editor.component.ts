import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSelectChange} from '@angular/material/select';
import {
  TaskDefinition,
  Unit,
  LearningOutcome,
  FeedbackTemplate,
  TaskService,
  FeedbackTemplateService,
} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {MatSort, Sort} from '@angular/material/sort';
import {
  confirmationModal,
  csvResultModalService,
  csvUploadModalService,
} from 'src/app/ajs-upgraded-providers';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';

@Component({
  selector: 'f-feedback-template-editor',
  templateUrl: 'feedback-template-editor.component.html',
})
export class FeedbackTemplateEditorComponent implements OnChanges, AfterViewInit {
  @Input() context?: TaskDefinition | Unit;
  @Input() selectedOutcome: LearningOutcome;

  @ViewChild('templateTable', {static: false}) templateTable: MatTable<FeedbackTemplate>;
  @ViewChild(MatSort, {static: false}) templateSort: MatSort;
  @ViewChild(MatPaginator, {static: false}) templatePaginator: MatPaginator;

  public templateSource: MatTableDataSource<FeedbackTemplate>;
  public templateColumns: string[] = [
    'icon',
    'parent',
    'chipText',
    'description',
    'commentText',
    'summaryText',
    'taskStatus',
    'feedbackTemplateAction',
  ];
  public selectedTemplate: FeedbackTemplate;
  public possibleParents: FeedbackTemplate[];

  constructor(
    private alerts: AlertService,
    private feedbackTemplateService: FeedbackTemplateService,
    private fileDownloaderService: FileDownloaderService,
    private taskService: TaskService,
    @Inject(csvResultModalService) private csvResultModalService: any,
    @Inject(csvUploadModalService) private csvUploadModal: any,
    @Inject(confirmationModal) private confirmationModal: any,
  ) {}

  ngAfterViewInit(): void {
    this.getFeedbackChips();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedTemplate = null;
    this.getFeedbackChips();
  }

  initialiseTable(feedbackTemplates: FeedbackTemplate[]) {
    this.templateSource = new MatTableDataSource<FeedbackTemplate>(feedbackTemplates);
    this.templateSource.paginator = this.templatePaginator;
    this.templateSource.sort = this.templateSort;
    this.templateSource.filterPredicate = (data: FeedbackTemplate, filter: string) => {
      const filterValue = filter.trim().toLowerCase();
      return (
        this.getParentChipText(data.parentChipId).toLowerCase().includes(filterValue) ||
        data.chipText.toLowerCase().includes(filterValue) ||
        data.commentText?.toLowerCase().includes(filterValue) ||
        data.summaryText?.toLowerCase().includes(filterValue) ||
        data.description.toLowerCase().includes(filterValue)
      );
    };
    this.sortTemplateData({active: 'chipText', direction: 'asc'});
  }

  public getFeedbackChips() {
    this.feedbackTemplateService.cache.values.subscribe((templates) => {
      const outcomeTemplates = templates.filter(
        (temp) => temp.learningOutcomeId === this.selectedOutcome.id,
      );
      this.possibleParents = outcomeTemplates.filter((temp) => temp.type === 'group');
      this.initialiseTable(outcomeTemplates);
    });
  }

  public saveFeedbackTemplate(feedbackTemplate: FeedbackTemplate) {
    if (
      !feedbackTemplate.chipText.trim() ||
      !feedbackTemplate.description.trim() ||
      (feedbackTemplate.type === 'template' &&
        (!feedbackTemplate.commentText.trim() || !feedbackTemplate.summaryText.trim()))
    ) {
      this.alerts.error('Failed to save feedback template. Fill in required fields.');
      return;
    }
    feedbackTemplate.save().subscribe({
      next: () => {
        this.alerts.success('Template saved');
        feedbackTemplate.setOriginalSaveData(this.feedbackTemplateService.mapping);
        this.selectFeedbackTemplate(this.selectedTemplate);
      },
      error: () => this.alerts.error('Failed to save feedback template. Please try again.'),
    });
  }

  public selectFeedbackTemplate(feedbackTemplate: FeedbackTemplate) {
    if (this.selectedTemplate === feedbackTemplate) {
      this.selectedTemplate = null;
    } else {
      this.selectedTemplate = feedbackTemplate;

      if (!this.selectedTemplate.hasOriginalSaveData) {
        this.selectedTemplate.setOriginalSaveData(this.feedbackTemplateService.mapping);
      }
    }
  }

  public sortTemplateData(sort: Sort) {
    sort.active = sort.active || 'chipText';
    sort.direction = sort.direction || 'asc';

    const isAsc = sort.direction === 'asc';

    // Generic sorting function for dynamic property access
    const compare = (a: FeedbackTemplate, b: FeedbackTemplate) => {
      const key = sort.active as keyof FeedbackTemplate;
      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * (isAsc ? 1 : -1);
      }
      return 0;
    };

    // Initial sorting by the chosen method
    const sortedTemplates = [...this.templateSource.data].sort(compare);

    // Determine maximum depth of the hierarchy (only groups contribute to depth)
    const depthMap = new Map<number, number>();
    let maxDepth = 0;

    const feedbackGroups = sortedTemplates.filter((t) => t.type === 'group');
    const feedbackTemplates = sortedTemplates.filter((t) => t.type !== 'group');

    feedbackGroups.forEach((template) => {
      let depth = 0;
      let parentId = template.parentChipId;

      while (parentId) {
        depth++;
        parentId = sortedTemplates.find((t) => t.id === parentId)?.parentChipId ?? null;
      }

      depthMap.set(template.id, depth);
      maxDepth = Math.max(maxDepth, depth);
    });

    // Assign sequential order numbers
    const orderMap = new Map<number, number>();
    let orderIndex = 1;

    sortedTemplates.forEach((template) => {
      orderMap.set(template.id, orderIndex++);
    });

    feedbackGroups.sort((a, b) => depthMap.get(a.id)! - depthMap.get(b.id)!);

    // Assign hierarchical order to groups using depth-based multiplier
    feedbackGroups.forEach((template) => {
      const parentOrder = template.parentChipId ? orderMap.get(template.parentChipId)! : 0;
      const depth = depthMap.get(template.id) ?? 0;
      const multiplier = 10 ** (maxDepth + 5 - depth * 3); // Proper scaling based on depth

      orderMap.set(template.id, parentOrder + orderMap.get(template.id)! * multiplier);
    });

    // Assign order values to templates by directly adding their parent's order
    feedbackTemplates.forEach((template) => {
      const parentOrder = orderMap.get(template.parentChipId) ?? 0;
      orderMap.set(template.id, parentOrder + orderMap.get(template.id)!);
    });

    // Sort again by computed hierarchical order
    sortedTemplates.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

    // Update the data source
    this.templateSource.data = [...sortedTemplates];
  }

  applyFilter(filterValue: string) {
    this.templateSource.filter = filterValue;
    if (this.templateSource.paginator) {
      this.templateSource.paginator.firstPage();
    }
  }

  public feedbackTemplateHasChanges(feedbackTemplate: FeedbackTemplate): boolean {
    return feedbackTemplate.hasChanges(this.feedbackTemplateService.mapping);
  }

  public deleteFeedbackTemplate(feedbackTemplate: FeedbackTemplate) {
    this.confirmationModal.show(
      'Delete feedback template',
      'Are you sure you want to delete this template? This action is final.',
      () => {
        feedbackTemplate.delete().subscribe({
          next: () => {
            this.alerts.success('Feedback template deleted');
            if (this.selectedTemplate === feedbackTemplate)
              this.selectFeedbackTemplate(this.selectedTemplate);
          },
          error: () => this.alerts.error('Failed to delete feedback template. Please try again.'),
        });
      },
    );
  }

  public uploadCsv() {
    const url = this.selectedOutcome.getFeedbackTemplateBatchUploadUrl();

    this.csvUploadModal.show(
      'Upload Feedback Templates as CSV',
      'Test message',
      {file: {name: 'Feedback Templates CSV Data', type: 'csv'}},
      url,
      (response: any) => {
        this.csvResultModalService.show('Feedback Templates CSV Upload Results', response);
        if (response.success.length > 0) {
          this.context.refresh();
        }
      },
    );
  }

  public downloadCsv() {
    const url = this.selectedOutcome.getFeedbackTemplateBatchUploadUrl();
    let name = `${this.selectedOutcome.abbreviation}-FeedbackTemplates.csv`;

    if (this.context instanceof TaskDefinition)
      name = `${this.context.unit.code}-${this.context.abbreviation}-${name}`;
    else if (this.context instanceof Unit) name = `${this.context.code}-${name}`;

    this.fileDownloaderService.downloadFile(url, name);
  }

  public createFeedbackTemplate() {
    if (this.selectedOutcome.isNew) {
      this.alerts.error('Save the new outcome to proceed.');
      return;
    }

    const feedbackTemplate = new FeedbackTemplate();

    feedbackTemplate.type = 'template';
    feedbackTemplate.chipText = '';
    feedbackTemplate.description = '';
    feedbackTemplate.commentText = '';
    feedbackTemplate.summaryText = '';
    feedbackTemplate.learningOutcomeId = this.selectedOutcome.id;

    this.selectedTemplate = feedbackTemplate;
  }

  onTemplateTypeChange(event: MatSelectChange): void {
    if (!this.selectedTemplate.isNew) {
      this.alerts.error('Template type change forbidden.');
      event.source.writeValue(this.selectedTemplate.type);
    } else {
      this.selectedTemplate.type = event.value;
    }
  }

  getPossibleParents(): FeedbackTemplate[] {
    if (!this.selectedTemplate.isNew)
      return this.possibleParents.filter(
        (p) => p.id != this.selectedTemplate.id && !this.isAncestor(this.selectedTemplate.id, p),
      );
    else return this.possibleParents;
  }

  isAncestor(idToCheck: number, descendant: FeedbackTemplate): boolean {
    if (descendant.parentChipId === idToCheck) return true;

    const parent = this.possibleParents.find((p) => p.id === descendant.parentChipId);
    if (!parent) return false;

    return this.isAncestor(idToCheck, parent);
  }

  getParentChipText(parentId: number): string {
    const parent = this.possibleParents.find((p) => p.id === parentId);
    return parent ? parent.chipText : '';
  }
}
