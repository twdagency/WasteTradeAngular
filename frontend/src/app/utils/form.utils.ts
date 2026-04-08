import { AbstractControl } from '@angular/forms';

/**
 * Marks every control as touched so validation messages appear,
 * then scrolls the viewport to the first invalid form-control element
 * and gives it focus.
 *
 * @param form        The root FormGroup / FormArray / FormControl.
 * @param container   Optional DOM element to scope the query (defaults to document).
 */
export function scrollToFirstInvalidControl(form: AbstractControl, container?: Element | null): void {
  form.markAllAsTouched();

  setTimeout(() => {
    const root = container ?? document;
    const el = root.querySelector('.ng-invalid[formcontrolname]') as HTMLElement | null;

    if (!el) return;

    const focusTarget =
      el.matches('input, textarea, select') ? el : (el.querySelector('input, textarea, select, [tabindex]') as HTMLElement | null) ?? el;

    focusTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    focusTarget.focus();
  });
}
