import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Post } from '../models/post';

@Injectable({ providedIn: 'root' })
export class PostService {
  apiUrl: string = 'https://nodejs-fb-app.herokuapp.com';
  // Getting Token
  data: any = localStorage.getItem('currentUser');
  token: string = this.data['token'];

  headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${this.token}`,
  });

  constructor(private http: HttpClient) {}

  // Create post
  createPost = (post: Post) => {
    return this.http.post<Post>(`${this.apiUrl}/posts/createpost`, post, {
      headers: this.headers,
    });
  };

  // Get post by postid
  getPostByPostId = (postId: string): any => {
    return this.http.get<any>(`${this.apiUrl}/posts/${postId}`, {
      headers: this.headers,
    });
  };

  // get post by user id
  getPostsByUserId = (userId: string) => {
    return this.http.post<any[]>(
      `${this.apiUrl}/posts/findpostbyuserid`,
      {
        id: userId,
      },
      { headers: this.headers }
    );
  };

  // get all posts
  getAllPosts = () => {
    return this.http.get<Post[]>(`${this.apiUrl}/posts/`, {
      headers: this.headers,
    });
  };

  // update a post
  updatePost = (post: Post) => {
    return this.http.put(`${this.apiUrl}/posts/${post.id}`, post, {
      headers: this.headers,
    });
  };

  // delete a post
  deletePost = (post: Post) => {
    return this.http.delete(`${this.apiUrl}/posts/${post.id}`, {
      headers: this.headers,
    });
  };

  // hide and unhide a post
  hideUnhidePost = (postId: string, isActive: boolean) => {
    return this.http.put(
      `${this.apiUrl}/posts/${postId}`,
      {
        isActive: isActive,
      },
      { headers: this.headers }
    );
  };

  // update bulk posts
  updateBulkPosts = (userId: string, photoId: string) => {
    return this.http.post<Post>(
      `${this.apiUrl}/posts/updatemanyposts`,
      {
        userId: userId,
        photoId: photoId,
      },
      { headers: this.headers }
    );
  };
}
