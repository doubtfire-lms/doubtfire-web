import { Component, Inject, Input, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { Project } from 'src/app/api/models/doubtfire-model';
import {
  AnonymizedPeerProgress,
  PeerProgressService,
} from 'src/app/api/services/peer-progress.service';

@Component({
  selector: 'f-peers-anonymized',
  templateUrl: './peers-anonymized.component.html',
  styleUrls: ['./peers-anonymized.component.scss'],
})
export class PeersAnonymizedComponent implements OnInit {
  @Input() project: Project;

  peers: AnonymizedPeerProgress[] = [];

  constructor(
    @Inject(UIRouter) private router: UIRouter,
    private peerProgressService: PeerProgressService,
  ) {}

  ngOnInit(): void {
    this.peers = this.peerProgressService.getAnonymizedPeers(this.project);
  }

  goBack(): void {
    this.router.stateService.go('projects/peer-progress', {
      projectId: this.project?.id,
    });
  }
}
