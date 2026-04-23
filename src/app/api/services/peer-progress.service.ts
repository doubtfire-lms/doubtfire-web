import { Injectable } from '@angular/core';
import { Project } from 'src/app/api/models/doubtfire-model';

export interface PeerProgressSummary {
  cohortAverage: number;
  yourProgress: number;
  peersAhead: number;
  strongestProgress: number;
  totalPeers: number;
  yourAlias: string;
}

export interface AnonymizedPeerProgress {
  alias: string;
  progress: number;
  bandLabel: string;
  isCurrentStudent: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PeerProgressService {
  private readonly sampleProgress = [92, 88, 84, 81, 78, 75, 72, 69];

  getSummary(project?: Project): PeerProgressSummary {
    const peers = this.getAnonymizedPeers(project);
    const currentPeer = peers.find((peer) => peer.isCurrentStudent) ?? peers[0];
    const strongestProgress = Math.max(...peers.map((peer) => peer.progress));
    const cohortAverage = Math.round(
      peers.reduce((total, peer) => total + peer.progress, 0) / peers.length,
    );

    return {
      cohortAverage,
      yourProgress: currentPeer.progress,
      peersAhead: peers.filter((peer) => peer.progress > currentPeer.progress).length,
      strongestProgress,
      totalPeers: peers.length,
      yourAlias: currentPeer.alias,
    };
  }

  getAnonymizedPeers(project?: Project): AnonymizedPeerProgress[] {
    const offset = (project?.id ?? 0) % this.sampleProgress.length;
    const currentIndex = offset % this.sampleProgress.length;

    return this.sampleProgress.map((_, index) => {
      const progress = this.sampleProgress[(index + offset) % this.sampleProgress.length];

      return {
        alias: `Peer ${String(index + 1).padStart(2, '0')}`,
        progress,
        bandLabel: this.toBandLabel(progress),
        isCurrentStudent: index === currentIndex,
      };
    });
  }

  private toBandLabel(progress: number): string {
    if (progress >= 85) return 'Leading';
    if (progress >= 75) return 'On Track';
    if (progress >= 65) return 'Building';
    return 'Needs Support';
  }
}
