import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { Project } from 'src/app/api/models/doubtfire-model';
import {
  AnonymizedPeerProgress,
  PeerProgressService,
  PeerProgressSummary,
} from 'src/app/api/services/peer-progress.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'f-peer-progress',
  templateUrl: './peer-progress.component.html',
  styleUrls: ['./peer-progress.component.scss'],
})
export class PeerProgressComponent implements OnInit, OnDestroy {
  @Input() project: Project;

  peers: AnonymizedPeerProgress[] = [];
  summary: PeerProgressSummary;
  private peerProgressSubscription?: Subscription;

  constructor(
    @Inject(UIRouter) private router: UIRouter,
    private peerProgressService: PeerProgressService,
  ) {}

  ngOnInit(): void {
    this.peerProgressSubscription = this.peerProgressService.getAnonymizedPeers(this.project).subscribe({
      next: (peers) => {
        this.peers = peers;
        this.summary = this.peerProgressService.getSummaryFromPeers(peers);
      },
    });
  }

  ngOnDestroy(): void {
    this.peerProgressSubscription?.unsubscribe();
  }

  goToAnonymizedPeers(): void {
    this.router.stateService.go('projects/peers-anonymized', {
      projectId: this.project?.id,
    });
  }
}
