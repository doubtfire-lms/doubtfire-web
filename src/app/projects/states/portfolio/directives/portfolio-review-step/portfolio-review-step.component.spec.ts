import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
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

  it('uses the normal confirmation before the deadline', () => {
    const deletePortfolio = vi.fn().mockReturnValue(of(undefined));
    component.project = {
      portfolioDeadlinePassed: false,
      portfolioAvailable: true,
      portfolioLocked: true,
      deletePortfolio,
    } as unknown as Project;

    component.deletePortfolio();

    expect(confirmationModal.show).toHaveBeenCalledWith(
      'Delete Portfolio?',
      expect.any(String),
      expect.any(Function),
      undefined,
      'Delete',
    );
    confirmationModal.show.mock.calls[0][2]();
    expect(deletePortfolio).toHaveBeenCalledWith(false);
    expect(component.project.portfolioLocked).toBe(false);
  });

  it('shows the effective deadline and sends late confirmation after the deadline', () => {
    const deletePortfolio = vi.fn().mockReturnValue(of(undefined));
    component.project = {
      portfolioDeadlinePassed: true,
      effectivePortfolioDeadline: new Date('2026-08-17T08:00:00Z'),
      effectivePortfolioDeadlineTimezone: 'Australia/Perth',
      portfolioAvailable: true,
      portfolioLocked: true,
      deletePortfolio,
    } as unknown as Project;

    component.deletePortfolio();

    expect(confirmationModal.show).toHaveBeenCalledWith(
      'Delete Portfolio and Submit Late?',
      expect.stringContaining('Australia/Perth'),
      expect.any(Function),
      undefined,
      'Delete and submit late',
    );
    confirmationModal.show.mock.calls[0][2]();
    expect(deletePortfolio).toHaveBeenCalledWith(true);
  });

  it('reopens the stronger confirmation when the deadline passes during deletion', () => {
    const deletePortfolio = vi
      .fn()
      .mockReturnValueOnce(
        throwError(() => 'Error Code: 409: Deleting this portfolio requires confirmation'),
      )
      .mockReturnValueOnce(of(undefined));
    component.project = {
      portfolioDeadlinePassed: false,
      effectivePortfolioDeadline: new Date('2026-08-17T10:00:00Z'),
      effectivePortfolioDeadlineTimezone: 'UTC',
      portfolioAvailable: true,
      portfolioLocked: true,
      deletePortfolio,
    } as unknown as Project;

    component.deletePortfolio();
    confirmationModal.show.mock.calls[0][2]();

    expect(component.project.portfolioDeadlinePassed).toBe(true);
    expect(confirmationModal.show).toHaveBeenLastCalledWith(
      'Delete Portfolio and Submit Late?',
      expect.any(String),
      expect.any(Function),
      undefined,
      'Delete and submit late',
    );
  });
});
