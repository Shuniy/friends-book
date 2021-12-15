import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Post } from '../models/post';

import { User } from '../models/user';
import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import { FileUploadService } from '../services/fileUpload.service';
import { PostService } from '../services/post.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  currentUser: User;
  viewingUser: User;
  users = [];
  unauthorized: boolean = false;
  public postText: string = '';
  public postsList: Post[] = [];
  public userPhoto: any;
  public viewUserId: string = '';
  public uploadingPostPicture = false;
  public postPicture: File;

  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
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
    this.getAllPosts();
  };

  submitPost = () => {
    var post = new Post();
    post.post = this.postText;
    post.userId = this.currentUser._id;
    post.userPhotoId = this.currentUser.photoId;
    post.userName =
      this.currentUser.firstName + ' ' + this.currentUser.lastName;
    post.isActive = true;
    post.isAdmin = this.currentUser.isAdmin;
    post.profession = 'user';

    this.sendPost(post);
  };

  postAd = () => {
    var post = new Post();
    post.post = '<ad>' + this.postText;
    post.userId = this.currentUser._id;
    post.userPhotoId = this.currentUser.photoId;
    post.userName =
      this.currentUser.firstName + ' ' + this.currentUser.lastName;
    post.isActive = true;
    post.isAdmin = this.currentUser.isAdmin;
    post.profession = 'user';

    this.sendPost(post);
  };

  sendPost = (post: Post) => {
    if (this.postPicture) {
      const formData = new FormData();
      formData.append('picture', this.postPicture);
      this.fileUploadService
        .uploadPhoto(formData)
        .pipe()
        .subscribe(
          (data) => {
            if (data) {
              post.postImageId = data['uploadId'];
              this.postService
                .createPost(post)
                .pipe()
                .subscribe(
                  (data) => {
                    if (data != null) {
                      this.alertService.successAlert(data['message']);

                      this.postText = '';
                      this.postPicture = null;
                      this.uploadingPostPicture = false;

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
    }
  };
  getAllPosts = () => {
    this.postService
      .getPostsByUserId(this.viewingUser._id)
      .pipe()
      .subscribe(
        (postsList) => {
          if (postsList != null) {
            this.postService
              .getAllPosts()
              .pipe()
              .subscribe((allPosts) => {
                var allAdminPosts = allPosts.filter((x) => {
                  return (
                    x.post !== undefined && x.post !== null
                    // && x.post.startsWith('<ad>')
                    // uncomment above line to only get posts
                  );
                });

                allAdminPosts.forEach((Post) => {
                  Post.post = Post.post.substring(4);
                  postsList.forEach((post, index) => {
                    if (post.id == Post.id) {
                      postsList.splice(index, 1);
                    }
                  });
                  postsList.push(Post);
                });

                var sortedData = postsList.sort((n1, n2) => {
                  if (n1.createdDate > n2.createdDate) {
                    return -1;
                  }
                  if (n1.createdDate < n2.createdDate) {
                    return 1;
                  }
                  return 0;
                });
                this.postsList = sortedData;
                this.getPostPhotos();
              });
          }
        },
        (error) => {
          this.alertService.errorAlert(error);
        }
      );
  };
  refreshPage = () => {
    this.loadProfileData();
  };

  getPostPhotos = () => {
    this.postsList.forEach((post) => {
      if (post.userPhotoId != null) {
        this.fileUploadService
          .getBlobPhotoById(post.userPhotoId)
          .pipe()
          .subscribe(
            (data) => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl =
                this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              post.userPhotoUrl = imageUrl;
            },
            (error) => {
              this.alertService.errorAlert(error);
            }
          );
      }
      if (post.postImageId != null && post.postImageId != '') {
        this.fileUploadService
          .getBlobPhotoById(post.postImageId)
          .pipe()
          .subscribe(
            (data) => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl =
                this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              post.postImageUrl = imageUrl;
            },
            (error) => {
              this.alertService.errorAlert(error);
            }
          );
      }
    });
  };

  hideUnhidePost = (post: Post) => {
    if (post.isActive) {
      this.postService
        .hideUnhidePost(post.id, false)
        .pipe()
        .subscribe((data) => {
          post.isActive = false;
          this.alertService.successAlert('Post has been hidden!');
        });
    } else {
      this.postService
        .hideUnhidePost(post.id, true)
        .pipe()
        .subscribe((data) => {
          post.isActive = true;
          this.alertService.successAlert('Post is now visible!');
        });
    }
  };

  postPictureChanged = (event) => {
    this.postPicture = event.target.files[0];
  };
  selectPostPicture = () => {
    this.uploadingPostPicture = true;
  };

  deleteUser = (id: number) => {
    this.userService
      .deleteUser(this.viewingUser._id)
      .pipe(first())
      .subscribe(() => this.loadAllUsers());
  };

  loadAllUsers = () => {
    this.userService
      .getAllUsers()
      .pipe(first())
      .subscribe((result) => {
        if (result == 'unauthorized access!') {
          this.users = [];
          this.unauthorized = true;
        } else {
          this.users = result;
        }
      });
  };
}
