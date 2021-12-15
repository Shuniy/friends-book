import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  apiUrl: string = 'https://nodejs-fb-app.herokuapp.com';
  // Getting Token
  data: any = localStorage.getItem('currentUser');
  token: string = this.data['token'];
  headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${this.token}`,
  });

  constructor(private http: HttpClient) {}

  // Registering user
  registerUser = (user: User) => {
    return this.http.post<User>(`${this.apiUrl}/users/register`, user);
  };

  // Getting all Users
  getAllUsers = (): any => {
    return this.http.get<any[]>(`${this.apiUrl}/users`, {
      headers: this.headers,
    });
  };

  // deleting user
  deleteUser = (id: string) => {
    return this.http.delete(`${this.apiUrl}/users/${id}`, {
      headers: this.headers,
    });
  };

  // get user details
  getUserDetail = (id: string) => {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, {
      headers: this.headers,
    });
  };

  // find user by email
  findUserByEmail = (email: string) => {
    return this.http.post<User>(
      `${this.apiUrl}/users/finduserbyemail`,
      {
        email: email,
      },
      {
        headers: this.headers,
      }
    );
  };

  // update user
  updateUser = (updatedUser: User) => {
    return this.http.put(
      `${this.apiUrl}/users/${updatedUser._id}`,
      updatedUser,
      {
        headers: this.headers,
      }
    );
  };

  // block and unblock user only for admin
  blockUnblockUser = (userId: string, active: boolean) => {
    return this.http.put(
      `${this.apiUrl}/users/${userId}`,
      {
        isActive: active,
      },
      {
        headers: this.headers,
      }
    );
  };

  // update user photoid
  updateUserPhotoId = (userId: string, photoId: string) => {
    return this.http.post(
      `${this.apiUrl}/users/updateuserphotoId`,
      {
        id: userId,
        photoId: photoId,
      },
      {
        headers: this.headers,
      }
    );
  };
}
