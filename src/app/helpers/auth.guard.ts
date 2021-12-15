import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';

@Injectable({ providedIn: 'root' })
// CanActivate decides if a route can be activated.
// If the guard returns true navigation continues,
// if any single returns false navigation fails
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const currentUser = this.authenticationService.currentUserValue;

    // if currentUser already present and currentUser has no message
    if (currentUser && currentUser['message'] == undefined) {
      // authorised so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
