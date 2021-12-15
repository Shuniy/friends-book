import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';
import { AlertService } from '../services/alert.service';
import { User } from '../models/user';
import { ConfirmPasswordValidator } from '../helpers/mismatch.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private alertService: AlertService
  ) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        dob: ['', [Validators.required]],
        gender: ['', Validators.required],
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      }
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit = () => {
    this.submitted = true;

    this.alertService.clearAlert();

    if (this.registerForm.invalid) {
      return;
    }

    let user = new User();

    user.firstName = this.registerForm.value['firstName'];
    user.lastName = this.registerForm.value['lastName'];
    user.email = this.registerForm.value['email'];
    user.password = this.registerForm.value['password'];
    user.dob = this.registerForm.value['dob'];
    user.gender = this.registerForm.value['gender'];

    this.loading = true;
    this.userService
      .registerUser(user)
      .pipe(first())
      .subscribe(
        (data) => {
          this.alertService.successAlert('Registration successful', true);
          this.router.navigate(['/login']);
        },
        (error) => {
          this.alertService.errorAlert(error);
          this.loading = false;
        }
      );
  };
}
