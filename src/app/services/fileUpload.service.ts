import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileSaver } from 'file-saver';
import { AlertService } from './alert.service';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  apiUrl: string = 'https://nodejs-fb-app.herokuapp.com';
  // Getting Token
  data: any = localStorage.getItem('currentUser');
  token: string = this.data['token'];
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.token}`,
  });

  constructor(private http: HttpClient, private alertService: AlertService) {}

  // upload a photo
  uploadPhoto = (formData: FormData) => {
    return this.http.post<any>(`${this.apiUrl}/files/uploadfile`, formData, {
      headers: this.headers,
    });
  };

  // get photo by id
  getBlobPhotoById = (id: string) => {
    return this.http.get(`${this.apiUrl}/files/${id}`, {
      headers: this.headers,
      responseType: 'blob',
    });
  };

  // get photo by id using file saver
  getPhotoById = (id: string) => {
    this.getBlobPhotoById(id).subscribe(
      (data) => {
        var filename = id + '.img';
        FileSaver.saveAs(data, filename);
      },
      (error) => {
        this.alertService.errorAlert(error);
      }
    );
  };
}
