import { Component, Inject, Input, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { Project } from 'src/app/api/models/doubtfire-model';
import {
  PeerProgressService,
  PeerProgressSummary,
} from 'src/app/api/services/peer-progress.service';

@Component({
  selector: 'f-peer-progress',
  templateUrl: './peer-progress.component.html',
  styleUrls: ['./peer-progress.component.scss'],
})
export class PeerProgressComponent implements OnInit {
  @Input() project: Project;

  summary: PeerProgressSummary;

  constructor(
    @Inject(UIRouter) private router: UIRouter,
    private peerProgressService: PeerProgressService,
  ) {}

  ngOnInit(): void {
    this.summary = this.peerProgressService.getSummary(this.project);
  }

  goToAnonymizedPeers(): void {
    this.router.stateService.go('projects/peers-anonymized', {
      projectId: this.project?.id,
    });
  }
}
