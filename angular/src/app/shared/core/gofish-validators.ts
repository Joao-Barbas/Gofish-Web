// gofish-validators.ts

import { ValidatorFn, AbstractControl, ValidationErrors, Validators } from "@angular/forms";

export class GofishValidators {
  static hasUppercase(control: AbstractControl): ValidationErrors | null {
    return /[A-Z]/.test(control.value ?? '') ? null : { hasuppercase: true };
  }

  static hasNumber(control: AbstractControl): ValidationErrors | null {
    return /\d/.test(control.value ?? '') ? null : { hasnumber: true };
  }

  static hasSpecialChar(control: AbstractControl): ValidationErrors | null {
    return /[^a-zA-Z0-9 ]/.test(control.value ?? '') ? null : { hasspecialchar: true };
  }

  // static businessEmail(control: AbstractControl): ValidationErrors | null {
  //   return control.value?.endsWith('@company.com')
  //     ? null
  //     : { businessEmail: true };
  // }

  static strongPassword(): ValidatorFn {
    return Validators.compose([
      GofishValidators.hasUppercase,
      GofishValidators.hasNumber,
      GofishValidators.hasSpecialChar,
    ])!;
  }

  static passwordsMatch(passwordField1: string, passwordField2: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordField1)?.value;
      const confirm  = group.get(passwordField2)?.value;
      return password === confirm ? null : { passwordsmatch: true };
    };
  }

  // static emailDomain(domain: string): ValidatorFn {
  //   return (control: AbstractControl) =>
  //     control.value?.endsWith(domain)
  //       ? null
  //       : { domain: { requiredDomain: domain } };
  // }
}
