import {Injectable} from '@angular/core';
import {Routes, UrlHandlingStrategy, UrlTree} from '@angular/router';
import {EditProfileComponent} from './account/edit-profile/edit-profile.component';
import {UnauthorisedComponent} from './errors/states/unauthorised/unauthorised.component';
import {TimeoutComponent} from './errors/states/timeout/timeout.component';
import {AcceptEulaComponent} from './eula/accept-eula/accept-eula.component';
import {HomeComponent} from './home/states/home/home.component';
import {SignInComponent} from './sessions/states/sign-in/sign-in.component';
import {WelcomeComponent} from './welcome/welcome.component';

const topLevelRoutePaths = new Set([
  '',
  'home',
  'sign_in',
  'welcome',
  'unauthorised',
  'timeout',
  'edit_profile',
  'eula',
]);

function primaryPath(url: UrlTree): string {
  return url.root.children['primary']?.segments.map((segment) => segment.path).join('/') ?? '';
}

export function isTopLevelAngularPath(path: string): boolean {
  const normalizedPath = path.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  return topLevelRoutePaths.has(normalizedPath);
}

@Injectable()
export class TopLevelUrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    return topLevelRoutePaths.has(primaryPath(url));
  }

  extract(url: UrlTree): UrlTree {
    return url;
  }

  merge(newUrlPart: UrlTree, _rawUrl: UrlTree): UrlTree {
    return newUrlPart;
  }
}

export const topLevelRoutes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: HomeComponent},
  {path: 'sign_in', component: SignInComponent},
  {path: 'welcome', component: WelcomeComponent},
  {path: 'unauthorised', component: UnauthorisedComponent},
  {path: 'timeout', component: TimeoutComponent},
  {path: 'edit_profile', component: EditProfileComponent},
  {path: 'eula', component: AcceptEulaComponent},
];
