import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noForbiddenPatternsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || typeof value !== 'string' || value.trim() === '') {
      return null;
    }
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneNumberPattern = /\+?(?:[().\s-]*[0-9]){7,15}[().\s-]*/;
    const urlPattern =
      /https?:\/\/(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|localhost)(?::\d{1,5})?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?/i;

    if (emailPattern.test(value)) {
      return { containsEmail: true };
    }

    if (phoneNumberPattern.test(value)) {
      return { containsPhoneNumber: true };
    }

    if (urlPattern.test(value)) {
      return { containsUrl: true };
    }

    return null;
  };
}
