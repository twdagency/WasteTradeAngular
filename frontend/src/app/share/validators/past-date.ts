import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const value = control.value;
    if (!value) {
      return null;
    }

    const inputDate = new Date(value);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < now) {
      return { past: true };
    }

    return null;
  };
}
