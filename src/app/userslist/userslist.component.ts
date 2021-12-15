import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FriendDTO } from '../models/friend';

import { User } from '../models/user';
import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import { FileUploadService } from '../services/fileUpload.service';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css'],
})
export class UserslistComponent implements OnInit {
  currentUser: User;
  public usersList: User[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    public router: Router
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }
  ngOnInit(): void {
    this.getAllUsers();
  }

  refreshPage = () => {
    this.getAllUsers();
  };

  getFriendPhoto = (friend: FriendDTO) => {
    if (friend.photoId != null) {
      this.fileUploadService
        .getBlobPhotoById(friend.photoId)
        .pipe()
        .subscribe(
          (data) => {
            var unsafeImageUrl = URL.createObjectURL(data);
            var imageUrl =
              this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
            friend.photoUrl = imageUrl;
          },
          (error) => {
            this.alertService.errorAlert(error);
          }
        );
    }
  };

  getAllUsersPhotos = () => {
    this.usersList.forEach((user) => {
      if (user.photoId != null) {
        this.fileUploadService
          .getBlobPhotoById(user.photoId)
          .pipe()
          .subscribe(
            (data) => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl =
                this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              user.photoUrl = imageUrl;
            },
            (error) => {
              this.alertService.errorAlert(error);
            }
          );
      }
    });
  };

  getAllUsers = () => {
    this.userService
      .getAllUsers()
      .pipe()
      .subscribe(
        (allUsers) => {
          if (allUsers != null && allUsers.length > 0) {
            //filter myself out
            allUsers.forEach((user, index) => {
              if (user._id == this.currentUser._id) {
                allUsers.splice(index, 1);
              }
            });

            this.usersList = allUsers;
            this.getAllUsersPhotos();
          }
        },
        (error) => {
          this.alertService.errorAlert(error);
        }
      );
  };
  onImageClick = (user: User) => {
    this.router.navigate(['home'], { queryParams: { id: user._id } });
  };

  blockUnblockUser = (user: User) => {
    if (user.isActive) {
      this.userService
        .blockUnblockUser(user._id, false)
        .pipe()
        .subscribe((data) => {
          user.isActive = false;
          this.alertService.successAlert(
            user.firstName + ' ' + user.lastName + ' has been blocked!'
          );
        });
    } else {
      this.userService
        .blockUnblockUser(user._id, true)
        .pipe()
        .subscribe((data) => {
          user.isActive = true;
          this.alertService.successAlert(
            user.firstName + ' ' + user.lastName + ' has been unblocked!'
          );
        });
    }
  };
}
