import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const value = control.value;
    if (value && !emailRegex.test(value)) {
      return { email: true };
    }
    return null;
  };
}
