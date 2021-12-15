import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
  // Subject is like an Objservable keeping track of all the listeners
  private subject = new Subject<any>();
  // Keeps track of Route change
  private keepAfterRouteChange = false;

  constructor(private router: Router) {
    // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    // events allows to track the lifecycle of router
    this.router.events.subscribe((event) => {
      // NavigationStart = event triggered when navigation starts
      if (event instanceof NavigationStart) {
        if (this.keepAfterRouteChange) {
          // Only keep alert for a single route change or redirected change
          this.keepAfterRouteChange = false;
        } else {
          // Clear alert message
          this.clearAlert();
        }
      }
    });
  }

  getAlert = (): Observable<any> => {
    return this.subject.asObservable();
  };

  successAlert = (message: string, keepAfterRouteChange = false) => {
    this.keepAfterRouteChange = keepAfterRouteChange;
    this.subject.next({ type: 'success', text: message });

    setTimeout(() => {
      this.subject.next();
    }, 3000);
  };

  errorAlert = (message: string, keepAfterRouteChange = false) => {
    this.keepAfterRouteChange = keepAfterRouteChange;
    this.subject.next({ type: 'error', text: message });

    setTimeout(() => {
      this.subject.next();
    }, 3000);
  };

  clearAlert = () => {
    // clear by calling subject.next() without parameters
    this.subject.next();
  };
}
