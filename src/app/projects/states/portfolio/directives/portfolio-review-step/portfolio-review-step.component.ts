import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {Task} from 'src/app/api/models/task';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {TaskService} from 'src/app/api/services/task.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-portfolio-review-step',
  templateUrl: 'portfolio-review-step.component.html',
  styleUrls: ['portfolio-review-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfolioReviewStepComponent implements OnInit {
  @Input() project: Project;
  @Input() unit: Unit;
  @Input() onAdvanceActiveTab?: (index: 1 | -1) => void;

  public externalName: string = 'OnTrack';
  public canCreatePortfolio: boolean = false;

  public readonly icons: Record<string, string> = {
    document: 'article_outlined',
    code: 'integration_instructions_outlined',
    image: 'image_outlined',
    zip: 'zip_outlined',
  };

  constructor(
    private constants: DoubtfireConstants,
    private projectService: ProjectService,
    private taskService: TaskService,
    private alertService: AlertService,
    private confirmationModal: ConfirmationModalService,
    private fileDownloaderService: FileDownloaderService,
  ) {}

  ngOnInit(): void {
    this.constants.ExternalName.subscribe((name) => {
      this.externalName = name;
    });
  }

  public get hasLearningSummaryReport(): boolean {
    return (this.project?.portfolioFiles ?? []).some((file) => file.idx === 0);
  }

  public get hasTasksSelected(): boolean {
    return this.selectedTasks.length > 0;
  }

  public get portfolioIsCompiling(): boolean {
    return Boolean(this.project?.compilePortfolio);
  }

  public get canCompilePortfolio(): boolean {
    return (
      !this.portfolioIsCompiling &&
      this.hasTasksSelected &&
      this.hasLearningSummaryReport &&
      !this.project?.portfolioAvailable
    );
  }

  public get unitHasILOs(): boolean {
    return (this.unit?.ilos?.length ?? 0) > 0;
  }

  public get extraFiles(): {kind: string; name: string; idx: number}[] {
    return (this.project?.portfolioFiles ?? []).filter((file) => file.idx !== 0);
  }

  public get selectedTasks(): Task[] {
    const toBeWorkedOn = this.taskService?.toBeWorkedOn ?? [];
    return [...(this.project?.tasks ?? [])]
      .filter((task) => !toBeWorkedOn.includes(task.status))
      .sort((a, b) => a.definition.seq - b.definition.seq);
  }

  public getIcon(kind: string): string {
    return this.icons[kind] ?? 'insert_drive_file';
  }

  public createPortfolio(): void {
    this.project.compilePortfolio = !this.project.compilePortfolio;

    this.projectService.update(this.project).subscribe({
      next: () => {
        this.project.compilePortfolio = true;
        this.project.portfolioStatus = 0.5;
      },
      error: (error) => {
        this.project.compilePortfolio = false;
        this.alertService.error(`Could not create portfolio: ${error}`, 6000);
      },
    });
  }

  public deletePortfolio(): void {
    this.confirmationModal.show(
      'Delete Portfolio?',
      'Are you sure you want to delete your portfolio? You will need to recreate your portfolio again if you do so.',
      () => {
        this.project.deletePortfolio().subscribe({
          next: () => {
            this.project.portfolioAvailable = false;
            this.project.portfolioStatus = 0;
            this.alertService.message('Portfolio has been deleted!', 5000);
          },
          error: (error) => {
            this.alertService.error(`Could not delete portfolio: ${error}`, 6000);
          },
        });
      },
    );
  }

  public downloadPortfolio(): void {
    const username = this.project?.student?.username ?? 'student';
    this.fileDownloaderService.downloadFile(
      this.project.portfolioUrl(true),
      `${username}-portfolio.pdf`,
    );
  }

  goBack() {
    if (this.onAdvanceActiveTab) {
      this.onAdvanceActiveTab(-1);
      return;
    }
  }
}
