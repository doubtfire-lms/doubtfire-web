import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MemberContribution} from 'src/app/api/models/groups/group';
import {Task} from 'src/app/api/models/task';
import {TaskStatusEnum} from 'src/app/api/models/task-status';
import {ProjectService} from 'src/app/api/services/project.service';
import {TaskService} from 'src/app/api/services/task.service';
import {FileUploaderComponent} from 'src/app/common/file-uploader/file-uploader.component';
import {AlertService} from 'src/app/common/services/alert.service';
import {EmojiService} from 'src/app/common/services/emoji.service';
import {PrivacyPolicy} from 'src/app/config/privacy-policy/privacy-policy';

type UploadStage = 'group' | 'details' | 'comments';
type UploadSubmissionType = TaskStatusEnum | 'reupload_evidence' | 'test_submission';

interface UploadSubmissionTypeOption {
  id: UploadSubmissionType;
  label: string;
}

interface UploadSubmissionFileSpec {
  name: string;
  type: string;
}

type UploadSubmissionFileMap = Record<string, UploadSubmissionFileSpec>;

interface TeamData {
  memberContributions: MemberContribution[];
}

interface UploadSubmissionResponse {
  id: number;
  project_id: number;
  status: TaskStatusEnum;
  [key: string]: unknown;
}

export interface UploadSubmissionModalData {
  task: Task;
  reuploadEvidence: boolean;
  isTestSubmission: boolean;
}

export interface UploadSubmissionModalCloseResult {
  value: Task;
}

export interface UploadSubmissionModalDismissResult {
  dismissed: true;
}

export type UploadSubmissionModalResult =
  | UploadSubmissionModalCloseResult
  | UploadSubmissionModalDismissResult;

@Component({
  selector: 'f-upload-submission-modal',
  templateUrl: './upload-submission-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UploadSubmissionModalComponent implements OnInit {
  @ViewChild(FileUploaderComponent) private fileUploader?: FileUploaderComponent;

  public readonly minCommentLength = 25;
  public readonly task = this.data.task;
  public readonly privacyPolicy = this.privacyPolicyService;
  public readonly fileRequirements: UploadSubmissionFileMap =
    this.task.definition.uploadRequirements.reduce((files, file) => {
      files[file.key] = {
        name: file.name,
        type: file.type,
      };
      return files;
    }, {} as UploadSubmissionFileMap);
  public readonly uploadUrl = this.data.isTestSubmission
    ? this.task.testSubmissionUrl()
    : this.task.submissionUrl();

  public submissionTypeOptions: UploadSubmissionTypeOption[] = [];
  public submissionType: UploadSubmissionType = 'ready_for_feedback';
  public currentStage: UploadStage = 'details';
  public payload: Record<string, unknown> = {};
  public team: TeamData = {memberContributions: []};
  public comment = '';
  public showPlagiarism = false;
  public isUploaderReady = false;
  public uploadStarted = false;
  public uploadSubmitLocked = false;

  private uploadResponse: UploadSubmissionResponse | null = null;
  private startUpload?: () => void;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UploadSubmissionModalData,
    private dialogRef: MatDialogRef<UploadSubmissionModalComponent, UploadSubmissionModalResult>,
    private taskService: TaskService,
    private projectService: ProjectService,
    private privacyPolicyService: PrivacyPolicy,
    private alertService: AlertService,
    private emojiService: EmojiService,
  ) {}

  ngOnInit(): void {
    this.submissionTypeOptions = this.buildSubmissionTypeOptions();
    this.submissionType = this.data.isTestSubmission
      ? 'test_submission'
      : this.data.reuploadEvidence
        ? 'reupload_evidence'
        : this.task.status;

    this.resetUploadState();
  }

  public get isUploading(): boolean {
    return this.fileUploader?.isUploading ?? false;
  }

  public get showGroupSection(): boolean {
    return this.submissionType === 'ready_for_feedback' && this.task.isGroupTask();
  }

  public get showCommentsSection(): boolean {
    return this.submissionType !== 'test_submission';
  }

  public get isDetailsStage(): boolean {
    return this.currentStage === 'details';
  }

  public get isGroupStage(): boolean {
    return this.currentStage === 'group' && this.showGroupSection;
  }

  public get isCommentsStage(): boolean {
    return this.currentStage === 'comments' && this.showCommentsSection;
  }

  public get requiresComment(): boolean {
    return (
      this.submissionType === 'need_help' ||
      ((this.submissionType === 'ready_for_feedback' ||
        this.submissionType === 'reupload_evidence') &&
        this.task.definition.assessInPortfolioOnly)
    );
  }

  public get submitTooltip(): string {
    return this.requiresComment && this.comment.trim().length < this.minCommentLength
      ? 'This submission requires a comment'
      : '';
  }

  public get commentPlaceholder(): string {
    if (this.submissionType === 'need_help') {
      return 'I need help with...';
    }

    if (
      this.submissionType === 'ready_for_feedback' &&
      this.task.definition.assessInPortfolioOnly
    ) {
      return 'I would like feedback with...';
    }

    return 'Make a comment...';
  }

  public get hasRatedTeamMember(): boolean {
    return this.team.memberContributions.some((member) => !!member.rating);
  }

  public shouldDisableNext(): boolean {
    if (this.isGroupStage) {
      return !this.hasRatedTeamMember;
    }

    if (this.isDetailsStage) {
      return !this.isUploaderReady;
    }

    return false;
  }

  public shouldDisableSubmit(): boolean {
    return (
      this.uploadSubmitLocked ||
      (this.showGroupSection && !this.hasRatedTeamMember) ||
      !this.isUploaderReady ||
      (this.requiresComment && this.comment.trim().length < this.minCommentLength)
    );
  }

  public onSubmissionTypeChange(newType: UploadSubmissionType): void {
    if (newType !== 'reupload_evidence' && newType !== 'test_submission') {
      this.task.status = newType as TaskStatusEnum;
    }

    this.submissionType = newType;
    this.resetUploadState();
  }

  public goToCommentsStage(): void {
    if (this.showCommentsSection && !this.shouldDisableNext()) {
      this.currentStage = 'comments';
    }
  }

  public goToGroupStage(): void {
    if (this.showGroupSection) {
      this.currentStage = 'group';
    }
  }

  public goToDetailsStage(): void {
    this.currentStage = 'details';
  }

  public cancel = (): void => {
    this.uploadSubmitLocked = false;
    this.dialogRef.close({dismissed: true});
  };

  public onReadyChange(isReady: boolean): void {
    this.isUploaderReady = isReady;
  }

  public onUploaderReady(startUpload: () => void): void {
    this.startUpload = startUpload;
  }

  public onBeforeUpload = (): void => {
    Object.keys(this.payload).forEach((key) => delete this.payload[key]);

    if (this.showGroupSection) {
      this.payload['contributions'] = this.mapTeamToPayload();
    }

    if (this.submissionType === 'need_help') {
      this.payload['trigger'] = 'need_help';
    }

    if (
      this.submissionType === 'assess_in_portfolio' ||
      this.task.status === 'assess_in_portfolio'
    ) {
      this.payload['trigger'] = 'assess_in_portfolio';
    }

    const trimmedComment = this.comment.trim();
    if (trimmedComment !== '') {
      this.payload['comment'] = this.emojiService.nativeEmojiToColons(trimmedComment);
    }
  };

  public onUploadSuccess = (response: unknown): void => {
    if (this.isValidUploadResponse(response)) {
      this.uploadResponse = response;

      if (this.data.isTestSubmission) {
        this.projectService.loadProject(response.project_id, this.task.unit).subscribe({
          next: (project) => {
            this.task.project = project;
          },
        });
      }

      return;
    }

    console.error('Invalid response', response);
    this.dialogRef.close({value: this.task});
    this.alertService.error(
      'Upload failed. Please try again, or contact your tutor if the issue continues.',
      8000,
    );
  };

  public onUploadComplete = (): void => {
    this.uploadSubmitLocked = false;

    if (!this.uploadResponse?.id) {
      return;
    }

    const response = this.uploadResponse;
    this.dialogRef.close({value: this.task});

    window.setTimeout(() => {
      if (this.data.isTestSubmission) {
        return;
      }

      const expectedStatus =
        this.submissionType === 'need_help' || this.submissionType === 'ready_for_feedback'
          ? this.submissionType
          : response.status;

      this.task.updateFromJson(response, this.taskService.mapping);
      this.task.processTaskStatusChange(expectedStatus as TaskStatusEnum, this.alertService);
    }, 1500);
  };

  public uploadButtonClicked(): void {
    if (this.uploadSubmitLocked || this.isUploading) {
      return;
    }

    this.uploadSubmitLocked = true;
    this.uploadStarted = true;
    this.currentStage = 'details';
    this.startUpload?.();
  }

  private buildSubmissionTypeOptions(): UploadSubmissionTypeOption[] {
    if (this.data.isTestSubmission) {
      return [{id: 'test_submission', label: 'Test Submission'}];
    }

    const options: UploadSubmissionTypeOption[] = this.taskService.submittableStatuses.map(
      (status) => ({
        id: status,
        label: this.taskService.statusLabels.get(status) ?? status,
      }),
    );

    if (this.task.inSubmittedState()) {
      options.push({id: 'reupload_evidence', label: 'New Evidence'});
    }

    return options;
  }

  private resetUploadState(): void {
    this.uploadStarted = false;
    this.uploadSubmitLocked = false;
    this.uploadResponse = null;
    this.currentStage = this.showGroupSection ? 'group' : 'details';
  }

  private mapTeamToPayload(): {project_id: number; pct: string; pts: number}[] {
    const total = this.task.group?.contributionSum(this.team.memberContributions) ?? 0;

    return this.team.memberContributions.map((member) => ({
      project_id: member.project.id,
      pct: total > 0 ? ((100 * member.rating) / total).toFixed(0) : '0',
      pts: member.rating,
    }));
  }

  private isValidUploadResponse(response: unknown): response is UploadSubmissionResponse {
    const candidate = response as Partial<UploadSubmissionResponse> | null;

    return !!candidate && typeof candidate === 'object' && !!candidate.id && !!candidate.project_id;
  }
}
