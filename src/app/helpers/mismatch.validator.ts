import { AbstractControl } from '@angular/forms';

// Validator for confirming password and confirm password match
export class ConfirmPasswordValidator {
  static MatchPassword = (control: AbstractControl) => {
    let password = control.get('password').value;
    let confirmPassword = control.get('confirmPassword').value;

    if (password != confirmPassword) {
      control.get('confirmPassword').setErrors({ ConfirmPassword: true });
    } else {
      return null;
    }
  };
}
