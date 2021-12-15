import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Friend } from '../models/friend';

import { User } from '../models/user';
import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import { FileUploadService } from '../services/fileUpload.service';
import { FriendsService } from '../services/friends.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css'],
})
export class NetworkComponent implements OnInit {
  currentUser: User;
  public usersList: User[] = [];
  public requestedToMeList: User[] = [];
  public requestedByMeList: User[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private friendsService: FriendsService,
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
    this.requestedByMeList = [];
    this.requestedToMeList = [];
    this.usersList = [];
    this.getAllUsers();
  };

  getAllUsersPhotos = () => {
    this.requestedByMeList.forEach((user) => {
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

    this.requestedToMeList.forEach((user) => {
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
    this.friendsService
      .getAllFriendRequests()
      .pipe()
      .subscribe((allFriends) => {
        var myFriendRequests = Array<any>();
        var friendRequestsToMe = Array<any>();

        if (allFriends != null && allFriends.length > 0) {
          myFriendRequests = allFriends.filter(
            (x) => x.userId == this.currentUser._id
          );

          friendRequestsToMe = allFriends.filter(
            (x) =>
              x.friendId == this.currentUser._id &&
              x.status == 'Request Pending!'
          );
          this.userService
            .getAllUsers()
            .pipe()
            .subscribe(
              (allUsers) => {
                if (allUsers != null && allUsers.length > 0) {
                  allUsers.forEach((user, index) => {
                    if (user._id == this.currentUser._id) {
                      allUsers.splice(index, 1);
                    }
                  });
                  myFriendRequests.forEach((friendRequest) => {
                    allUsers.forEach((user, index) => {
                      if (user._id == friendRequest.friendId) {
                        if (friendRequest.status == 'You are friend!') {
                          allUsers.splice(index, 1);
                        } else {
                          user.friendStatus = friendRequest.status;
                          this.requestedByMeList.push(user);
                          allUsers.splice(index, 1);
                        }
                      }
                    });
                  });

                  friendRequestsToMe.forEach((friendRequest) => {
                    allUsers.forEach((user, index) => {
                      if (user._id == friendRequest.userId) {
                        this.requestedToMeList.push(user);
                        allUsers.splice(index, 1);
                      }
                    });
                  });

                  this.usersList = allUsers;
                  this.getAllUsersPhotos();
                }
              },
              (error) => {
                this.alertService.errorAlert(error);
              }
            );
        }
      });
  };
  sendRequest = (user: User) => {
    var friend = new Friend();
    friend.userId = this.currentUser._id;
    friend.friendId = user._id;
    friend.status = 'Request Pending!';

    this.friendsService
      .createFriendRequest(friend)
      .pipe()
      .subscribe(
        (data) => {
          if (data != null) {
            this.alertService.successAlert('Friend Request Sent!');
            this.refreshPage();
          }
        },
        (error) => {
          this.alertService.errorAlert(error);
        }
      );
  };
  acceptRequest = (user: User) => {
    var friend = new Friend();
    friend.userId = this.currentUser._id;
    friend.friendId = user._id;
    friend.status = 'You are friend';

    this.updateRequest(friend, true);
  };

  rejectRequest = (user: User) => {
    var friend = new Friend();
    friend.userId = this.currentUser._id;
    friend.friendId = user._id;
    friend.status = 'Request Rejected!';

    this.updateRequest(friend, false);
  };

  updateRequest = (friend: Friend, accepted: boolean) => {
    this.friendsService
      .getAllFriendRequests()
      .pipe()
      .subscribe(
        (data) => {
          if (data != null && data.length > 0) {
            //get existing request
            var friendRequest = data.filter(
              (x) =>
                x.userId == friend.friendId &&
                x.friendId == this.currentUser._id
            );
            friend.id = friendRequest[0].id;

            this.friendsService
              .updateFriendRequestById(friend)
              .pipe()
              .subscribe(
                (data) => {
                  if (data != null) {
                    if (accepted) {
                      this.alertService.successAlert(
                        'Friend Request Accepted!'
                      );
                    } else {
                      this.alertService.successAlert(
                        'Friend Request Rejected!'
                      );
                    }

                    this.refreshPage();
                  }
                },
                (error) => {
                  this.alertService.errorAlert(error);
                }
              );
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
}
