import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {Project} from 'src/app/api/models/project';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-portfolio-add-extra-files-step',
  templateUrl: 'portfolio-add-extra-files-step.component.html',
  styleUrls: ['portfolio-add-extra-files-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfolioAddExtraFilesStepComponent implements OnInit {
  @Input() project: Project;
  @Input() onAdvanceActiveTab?: (index: 1 | -1) => void;

  public uploadType: 'document' | 'code' | 'image' | 'zip' = 'document';

  public isUploading: boolean;

  public uploadFileType = {
    file0: {
      name: 'Other',
      type: 'document',
    },
  };

  public uploadFilePayload = {
    name: 'Other',
    kind: 'document',
  };

  constructor(private alertService: AlertService) {}

  public readonly icons = {
    document: 'article_outlined',
    code: 'integration_instructions_outlined',
    image: 'image_outlined',
    zip: 'zip_outlined',
  };

  ngOnInit(): void {
    this.uploadType = 'document';

    this.uploadFileType = {
      file0: {
        name: 'Other',
        type: 'document',
      },
    };

    this.uploadFilePayload = {
      name: 'Other',
      kind: 'document',
    };
  }
  onTypeChange(event: MatSelectChange) {
    console.log('on type change', event);
    this.uploadFileType = {
      file0: {
        name: 'Other',
        type: event.value,
      },
    };

    this.uploadFilePayload = {
      name: 'Other',
      kind: event.value,
    };
  }

  public get extraFiles() {
    // If file.idx === 0, then it's the Learning Summary Report, so we ignore it here
    return this.project?.portfolioFiles.filter((file) => file.idx !== 0);
  }

  deleteFileFromPortfolio(file: {idx: number; kind: string; name: string}) {
    this.project.deleteFileFromPortfolio(file).subscribe({
      next: () => {
        this.alertService.success('Succesfully delete file', 3000);
      },
      error: (error) => {
        this.alertService.error(`Failed to delete file: ${error}`, 6000);
      },
    });
  }

  advanceActiveTab(index: 1 | -1) {
    if (this.onAdvanceActiveTab) {
      this.onAdvanceActiveTab(index);
      return;
    }
  }

  addNewFilesToPortfolio(newFile: {kind: string; name: string; idx: number}) {
    this.project.portfolioFiles.push(newFile);
  }
}
