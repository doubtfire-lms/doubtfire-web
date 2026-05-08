import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { Project } from 'src/app/api/models/doubtfire-model';
import {
  AnonymizedPeerProgress,
  PeerProgressService,
} from 'src/app/api/services/peer-progress.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'f-peers-anonymized',
  templateUrl: './peers-anonymized.component.html',
  styleUrls: ['./peers-anonymized.component.scss'],
})
export class PeersAnonymizedComponent implements OnInit, OnDestroy {
  @Input() project: Project;

  peers: AnonymizedPeerProgress[] = [];
  readonly pageSize = 10;
  currentPage = 0;
  private peerProgressSubscription?: Subscription;

  constructor(
    @Inject(UIRouter) private router: UIRouter,
    private peerProgressService: PeerProgressService,
  ) {}

  ngOnInit(): void {
    this.peerProgressSubscription = this.peerProgressService.getAnonymizedPeers(this.project).subscribe({
      next: (peers) => {
        this.peers = peers;
        this.currentPage = 0;
      },
    });
  }

  ngOnDestroy(): void {
    this.peerProgressSubscription?.unsubscribe();
  }

  goBack(): void {
    this.router.stateService.go('projects/peer-progress', {
      projectId: this.project?.id,
    });
  }

  get paginatedPeers(): AnonymizedPeerProgress[] {
    const start = this.currentPage * this.pageSize;
    return this.peers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.peers.length / this.pageSize));
  }

  get startPeerIndex(): number {
    return this.peers.length === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get endPeerIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.peers.length);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage -= 1;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage += 1;
    }
  }
}
