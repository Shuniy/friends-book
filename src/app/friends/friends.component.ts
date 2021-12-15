import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Friend, FriendDTO } from '../models/friend';

import { User } from '../models/user';
import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import { FileUploadService } from '../services/fileUpload.service';
import { FriendsService } from '../services/friends.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent implements OnInit {
  currentUser: User;
  public friendsList: FriendDTO[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private friendsService: FriendsService,
    private fileUploadService: FileUploadService,
    private alertService: AlertService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    public router: Router
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }
  ngOnInit(): void {
    this.getAllFriends();
  }

  refreshPage = () => {
    this.getAllFriends();
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

  getAllFriends = () => {
    this.friendsService
      .getAllFriendRequests()
      .pipe()
      .subscribe((allFriends) => {
        var myRequests = Array<any>();
        var requestsToMe = Array<any>();
        if (allFriends != null && allFriends.length > 0) {
          myRequests = allFriends.filter(
            (x) =>
              x.userId == this.currentUser._id && x.status == 'You are friend'
          );

          myRequests.forEach((friend) => {
            this.userService
              .getUserDetail(friend.friendId)
              .pipe()
              .subscribe((user) => {
                if (user != null) {
                  if (user._id != this.currentUser._id) {
                    var FriendDTO = new FriendDTO();
                    FriendDTO.id = friend.friendId;
                    FriendDTO.photoId = user.photoId;
                    FriendDTO.fullName = user.firstName + ' ' + user.lastName;
                    this.getFriendPhoto(FriendDTO);
                    this.friendsList.push(FriendDTO);
                  }
                }
              });
          });

          requestsToMe = allFriends.filter(
            (x) =>
              x.friendId == this.currentUser._id && x.status == 'You are friend'
          );

          requestsToMe.forEach((friend) => {
            this.userService
              .getUserDetail(friend.userId)
              .pipe()
              .subscribe((user) => {
                if (user != null) {
                  if (user._id != this.currentUser._id) {
                    var FriendDTO = new FriendDTO();
                    FriendDTO.id = friend.userId;
                    FriendDTO.photoId = user.photoId;
                    FriendDTO.fullName = user.firstName + ' ' + user.lastName;
                    this.getFriendPhoto(FriendDTO);
                    this.friendsList.push(FriendDTO);
                  }
                }
              });
          });
        }
      });
  };
  onImageClick = (friend: FriendDTO) => {
    this.router.navigate(['home'], { queryParams: { id: friend.id } });
  };
}
