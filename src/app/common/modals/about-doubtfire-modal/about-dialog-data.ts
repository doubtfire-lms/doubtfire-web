import { GithubProfile } from './github-profile';
import { ContributorData } from './contributor-data';
import { BehaviorSubject } from 'rxjs';
import { Sort } from '@angular/material/sort';

/**
 * The data shared between the AboutDoubtfireModal and its associated
 * Service. This enables the service to load and populate a shared
 * object.
 */
export class AboutDialogData {
  public externalName: string;
  public mainContributors: GithubProfile[];
  public allContributors: BehaviorSubject<ContributorData[]>;

  constructor() {
    this.externalName = '';
    this.mainContributors = [];
    this.allContributors = new BehaviorSubject<ContributorData[]>([]);
  }

  public addContributor(contributor: ContributorData) {
    const value = this.allContributors.value;
    value.push(contributor);
    this.allContributors.next(value);
  }

  public sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    const original = this.allContributors.value;

    this.allContributors.next(
      original.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'contributor':
            return compare(a.login, b.login, isAsc);
          case 'contributions':
            return compare(a.totalContributions(), b.totalContributions(), isAsc);
          case 'api-contributions':
            return compare(a.apiContributions, b.apiContributions, isAsc);
          case 'web-contributions':
            return compare(a.webContributions, b.webContributions, isAsc);
          case 'io-contributions':
            return compare(a.ioContributions, b.ioContributions, isAsc);
          default:
            return 0;
        }
      })
    );
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
