import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Friend } from '../models/friend';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  apiUrl: string = 'https://nodejs-fb-app.herokuapp.com';
  // Getting Token
  data: any = localStorage.getItem('currentUser');
  token: string = this.data['token'];
  headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${this.token}`,
  });

  constructor(private http: HttpClient) {}

  // create friend request
  createFriendRequest = (friend: Friend) => {
    return this.http.post(`${this.apiUrl}/friends/createrequest`, friend);
  };

  // update friend request
  updateFriendRequestById = (updatedRequest: Friend): any => {
    return this.http.put<any>(
      `${this.apiUrl}/friends/${updatedRequest.id}`,
      updatedRequest,
      { headers: this.headers }
    );
  };

  // get all friend request
  getAllFriendRequests = () => {
    return this.http.get<any[]>(`${this.apiUrl}/friends/`, {
      headers: this.headers,
    });
  };

  // get friend request by id
  getFriendRequestById = (id: string): any => {
    return this.http.get<Friend>(`${this.apiUrl}/friends/${id}`, {
      headers: this.headers,
    });
  };
}
