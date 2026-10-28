import {EntityCache} from 'ngx-entity-service';
import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  FeedbackTemplateService,
  LearningOutcome,
  LearningOutcomeService,
  TaskDefinition,
  TaskService,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';
import {ConfirmationModalService} from '../modals/confirmation-modal/confirmation-modal.service';
import {CsvResultModalService} from '../modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from '../modals/csv-upload-modal/csv-upload-modal.service';
import {AlertService} from '../services/alert.service';
import {LearningOutcomeEditorComponent} from './learning-outcome-editor.component';
import {NestedCsvDownloadModalService} from './nested-csv-download-modal/nested-csv-download-modal.service';

describe('LearningOutcomeEditorComponent', () => {
  let component: LearningOutcomeEditorComponent;
  let fixture: ComponentFixture<LearningOutcomeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LearningOutcomeEditorComponent],
      providers: [
        {provide: AlertService, useValue: {}},
        {
          provide: LearningOutcomeService,
          useValue: {cache: new EntityCache<LearningOutcome>()},
        },
        {provide: FileDownloaderService, useValue: {}},
        {provide: NestedCsvDownloadModalService, useValue: {}},
        {provide: FeedbackTemplateService, useValue: {}},
        {provide: TaskService, useValue: {}},
        {provide: CsvResultModalService, useValue: {}},
        {provide: CsvUploadModalService, useValue: {}},
        {provide: ConfirmationModalService, useValue: {}},
      ],
    })
      .overrideComponent(LearningOutcomeEditorComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(LearningOutcomeEditorComponent);
    component = fixture.componentInstance;
  });

  it('shows learning outcomes from the newly selected task', () => {
    const unit = new Unit();
    const firstTask = new TaskDefinition(unit);
    const secondTask = new TaskDefinition(unit);
    const firstOutcome = learningOutcome(1, 'TLO1');
    const secondOutcome = learningOutcome(2, 'TLO2');

    firstTask.learningOutcomesCache.add(firstOutcome);
    secondTask.learningOutcomesCache.add(secondOutcome);

    fixture.componentRef.setInput('context', firstTask);
    fixture.detectChanges();
    expect(component.outcomeSource.data).toEqual([firstOutcome]);

    fixture.componentRef.setInput('context', secondTask);
    fixture.detectChanges();
    expect(component.outcomeSource.data).toEqual([secondOutcome]);

    firstTask.learningOutcomesCache.add(learningOutcome(3, 'TLO3'));
    expect(component.outcomeSource.data).toEqual([secondOutcome]);
  });
});

function learningOutcome(id: number, abbreviation: string): LearningOutcome {
  const outcome = new LearningOutcome();
  outcome.id = id;
  outcome.abbreviation = abbreviation;
  outcome.shortDescription = abbreviation;
  outcome.fullOutcomeDescription = abbreviation;
  return outcome;
}
