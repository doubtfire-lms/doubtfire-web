import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import {ProjectService} from 'src/app/api/services/project.service';
import {TaskService} from 'src/app/api/services/task.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {PortfolioReviewStepComponent} from './portfolio-review-step.component';

describe('PortfolioReviewStepComponent', () => {
  let component: PortfolioReviewStepComponent;
  let fixture: ComponentFixture<PortfolioReviewStepComponent>;
  let confirmationModal: {show: ReturnType<typeof vi.fn>};

  beforeEach(async () => {
    confirmationModal = {show: vi.fn()};

    await TestBed.configureTestingModule({
      declarations: [PortfolioReviewStepComponent],
      providers: [
        {provide: DoubtfireConstants, useValue: {ExternalName: of('OnTrack')}},
        {provide: ProjectService, useValue: {}},
        {provide: TaskService, useValue: {toBeWorkedOn: []}},
        {provide: AlertService, useValue: {message: vi.fn(), error: vi.fn()}},
        {provide: ConfirmationModalService, useValue: confirmationModal},
        {provide: FileDownloaderService, useValue: {}},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PortfolioReviewStepComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(PortfolioReviewStepComponent);
    component = fixture.componentInstance;
    component.unit = {lockProjectOnPortfolioSubmission: true} as unknown as Unit;
  });

  it('deletes the portfolio after confirmation and clears the lock', () => {
    const deletePortfolio = vi.fn().mockReturnValue(of(undefined));
    component.project = {
      portfolioAvailable: true,
      portfolioLocked: true,
      deletePortfolio,
    } as unknown as Project;

    component.deletePortfolio();

    expect(confirmationModal.show).toHaveBeenCalledWith(
      'Delete Portfolio?',
      expect.any(String),
      expect.any(Function),
    );
    confirmationModal.show.mock.calls[0][2]();

    expect(deletePortfolio).toHaveBeenCalled();
    expect(component.project.portfolioAvailable).toBe(false);
    expect(component.project.portfolioLocked).toBe(false);
  });
});
