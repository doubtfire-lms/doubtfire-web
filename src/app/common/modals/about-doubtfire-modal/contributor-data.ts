/**
 * ContributorData contains the information on contributions to
 * the api, web, and doubtfire.io git repos.
 */
export class ContributorData {
  login: string;
  htmlUrl: string;
  avatarUrl: string;
  apiContributions: number;
  webContributions: number;
  ioContributions: number;
  constructor(login: string, htmlUrl: string, avatarUrl: string) {
    this.login = login;
    this.htmlUrl = htmlUrl;
    this.avatarUrl = avatarUrl;
    this.apiContributions = 0;
    this.webContributions = 0;
    this.ioContributions = 0;
  }
  totalContributions(): number {
    return this.apiContributions + this.webContributions + this.ioContributions;
  }
}
