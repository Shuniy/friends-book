import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user';
import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import { FileUploadService } from '../services/fileUpload.service';
import { FriendsService } from '../services/friends.service';
import { PostService } from '../services/post.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-card-profile',
  templateUrl: './card-profile.component.html',
  styleUrls: ['./card-profile.component.css'],
})
export class CardProfileComponent implements OnInit {
  currentUser: User;
  viewingUser: User;
  users = [];
  unauthorized: boolean = false;
  public friendsCount: number = 0;
  public postsCount: number = 0;
  public userPhoto: any;
  public viewUserId: string = '';
  public uploadingPostPicture = false;
  public postPicture: File;

  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private friendsService: FriendsService,
    private postService: PostService,
    private alertService: AlertService,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private userService: UserService
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.unauthorized = false;

    this.route.queryParams.subscribe((params) => {
      this.viewUserId = '';
      if (params['id'] != null && params['id'] != '') {
        this.viewUserId = params['id'];

        this.userService
          .getUserDetail(this.viewUserId)
          .pipe()
          .subscribe((data) => {
            if (data != null) {
              this.viewingUser = data;
              this.loadProfileData();
            }
          });
      } else {
        this.viewingUser = this.currentUser;

        this.loadProfileData();
      }
    });
  }

  loadProfileData = () => {
    this.setNumberOfFriends();
    this.setNumberOfPosts();
    this.userPhoto = this.getUserPhotoUrl(this.viewingUser.photoId);
  };

  refreshPage = () => {
    this.loadProfileData();
  };

  setNumberOfFriends = () => {
    this.friendsService
      .getAllFriendRequests()
      .pipe()
      .subscribe(
        (data) => {
          if (data != null && data.length > 0) {
            var friendCount = data.filter(
              (x) =>
                (x.userId == this.viewingUser._id ||
                  x.friendId == this.viewingUser._id) &&
                x.status == 'You are friend'
            ).length;
            this.friendsCount = friendCount;
          }
        },
        (error) => {
          this.alertService.errorAlert(error);
        }
      );
  };

  setNumberOfPosts = () => {
    this.postService
      .getPostsByUserId(this.viewingUser._id)
      .pipe()
      .subscribe(
        (data) => {
          if (data != null && data.length > 0) {
            this.postsCount = data.length;
          }
        },
        (error) => {
          this.alertService.errorAlert(error);
        }
      );
  };
  getUserPhotoUrl = (id: string) => {
    this.fileUploadService
      .getBlobPhotoById(id)
      .pipe()
      .subscribe(
        (data) => {
          var unsafeImageUrl = URL.createObjectURL(data);
          var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
          this.userPhoto = imageUrl;
        },
        (error) => {
          this.alertService.errorAlert(error);
        }
      );
  };

  uploadProfilePicture = (event) => {
    const file: File = event.target.files[0];

    if (file) {
      var fileName = file.name;
      const formData = new FormData();
      formData.append('picture', file);

      this.fileUploadService
        .uploadPhoto(formData)
        .pipe()
        .subscribe(
          (data) => {
            if (data) {
              this.currentUser.photoId = data['uploadId'];
              this.userService
                .updateUserPhotoId(
                  this.currentUser._id,
                  this.currentUser.photoId
                )
                .pipe()
                .subscribe(
                  (data2) => {
                    this.postService
                      .updateBulkPosts(
                        this.currentUser._id,
                        this.currentUser.photoId
                      )
                      .pipe()
                      .subscribe(
                        (data3) => {
                          localStorage.setItem(
                            'currentUser',
                            JSON.stringify(this.currentUser)
                          );
                          this.refreshPage();
                        },
                        (error) => {
                          this.alertService.errorAlert(error);
                        }
                      );
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
    }
  };
  postPictureChanged = (event) => {
    this.postPicture = event.target.files[0];
  };
  selectPostPicture = () => {
    this.uploadingPostPicture = true;
  };
}
