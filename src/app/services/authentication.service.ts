import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  apiUrl: string = 'https://nodejs-fb-app.herokuapp.com';

  // BehaviorSubject needs a initial value as it always returns some value
  // even if it has received a next()
  private currentUserSubject: BehaviorSubject<User>;
  // Observable only triggers when it receives onnext()
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    // Getting the currentUser from localStorage and adding as intital value to BehaviorSubject
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login = (email: any, password: any) => {
    return this.http
      .post<any>(`${this.apiUrl}/users/authenticate`, {
        email: email,
        password: password,
      })
      .pipe(
        map((user) => {
          // Adding currentUser after login to localStorage and adding next to BehaviorSubject
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  };

  logout = () => {
    // On logout removing currentUser from localStorage
    localStorage.removeItem('currentUser');
    // Assigning BehaviorSubject to null
    this.currentUserSubject.next(null);
  };
}
