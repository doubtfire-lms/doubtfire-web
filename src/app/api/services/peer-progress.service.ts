import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Project } from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiURL';

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

interface PeerProgressApiResponse {
  alias: string;
  progress: number;
  band_label: string;
  is_current_student: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PeerProgressService {
  constructor(private httpClient: HttpClient) {}

  getSummaryFromPeers(peers: AnonymizedPeerProgress[]): PeerProgressSummary {
    if (peers.length === 0) {
      return {
        cohortAverage: 0,
        yourProgress: 0,
        peersAhead: 0,
        strongestProgress: 0,
        totalPeers: 0,
        yourAlias: 'Peer 01',
      };
    }

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

  getAnonymizedPeers(project?: Project): Observable<AnonymizedPeerProgress[]> {
    return this.httpClient
      .get<PeerProgressApiResponse[]>(`${API_URL}/projects/${project?.id}/peer_progress`)
      .pipe(
        map((peers) =>
          peers.map((peer) => ({
            alias: peer.alias,
            progress: peer.progress,
            bandLabel: peer.band_label,
            isCurrentStudent: peer.is_current_student,
          })),
        ),
      );
  }
}
