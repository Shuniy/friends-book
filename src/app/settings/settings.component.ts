import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';
import { AlertService } from '../services/alert.service';
import { User } from '../models/user';
import { ConfirmPasswordValidator } from '../helpers/mismatch.validator';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  resetPasswordForm: FormGroup;
  public loading = false;
  public submitted = false;
  public currentUser: User;
  public loadedUser: User;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private alertService: AlertService
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    // Loading User Details
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      phone: ['', Validators.required],
      dob: ['', [Validators.required]],
      gender: ['', Validators.required],
    });

    this.resetPasswordForm = this.formBuilder.group(
      {
        password: [
          '',
          [
            Validators.required,

            Validators.minLength(6),
            Validators.pattern(
              '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'
            ),
            ,
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      }
    );

    this.refreshPage();
  }

  // refresh page
  refreshPage = () => {
    this.userService
      .getUserDetail(this.currentUser._id)
      .pipe()
      .subscribe((data) => {
        if (data) {
          this.loadedUser = data;
          this.profileForm.patchValue({
            firstName: this.loadedUser.firstName,
            lastName: this.loadedUser.lastName,
            email: this.loadedUser.email,
            city: this.loadedUser.city || '',
            state: this.loadedUser.state || '',
            country: this.loadedUser.country || '',
            phone: this.loadedUser.phone || '',
            dob: this.loadedUser.dob.substring(
              0,
              this.loadedUser.dob.indexOf('T')
            ),
            gender: this.loadedUser.gender,
          });
        }
      });
  };

  // get profileForm controls
  get getPF() {
    return this.profileForm.controls;
  }

  // get resetPasswordForm controls
  get getRPForm() {
    return this.resetPasswordForm.controls;
  }

  // On Submit
  onSubmit = () => {
    this.submitted = true;
    this.alertService.clearAlert();

    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;

    this.loadedUser.firstName = this.profileForm.value['firstName'];
    this.loadedUser.lastName = this.profileForm.value['lastName'];
    this.loadedUser.email = this.profileForm.value['email'];
    this.loadedUser.dob = this.profileForm.value['dob'];
    this.loadedUser.gender = this.profileForm.value['gender'];
    this.loadedUser.city = this.profileForm.value['city'];
    this.loadedUser.state = this.profileForm.value['state'];
    this.loadedUser.country = this.profileForm.value['country'];
    this.loadedUser.phone = this.profileForm.value['phone'];

    this.userService
      .updateUser(this.loadedUser)
      .pipe()
      .subscribe((data) => {
        if (data != null) {
          this.alertService.successAlert('User Details Updated!');
          this.loading = false;
          this.submitted = false;
          this.updateCurrentUser(this.loadedUser);
          this.refreshPage();
        }
      });
  };

  // updating the current user
  updateCurrentUser = (user: User) => {
    this.currentUser.firstName = user.firstName;
    this.currentUser.lastName = user.lastName;
    this.currentUser.email = user.email;
    this.currentUser.dob = user.dob;
    this.currentUser.gender = user.gender;
    this.currentUser.city = user.city;
    this.currentUser.state = user.state;
    this.currentUser.country = user.country;
    this.currentUser.phone = user.phone;

    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  };

  // reset password
  resetPassword = () => {
    if (this.loadedUser != null) {
      this.loading = true;
      this.submitted = true;

      this.currentUser.password = this.resetPasswordForm.value['password'];

      this.userService
        .updateUser(this.currentUser)
        .pipe()
        .subscribe((data) => {
          if (data != null) {
            this.loading = false;
            this.submitted = false;
            this.alertService.successAlert('Password Successfully Updated');
          }
        });
    }
  };
}
