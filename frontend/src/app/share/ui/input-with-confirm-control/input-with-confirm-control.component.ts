import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { strictEmailValidator } from '@app/validators';
import { TranslateModule } from '@ngx-translate/core';

const CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputWithConfirmControlComponent),
  multi: true,
};

const CONTROL_VALUE_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => InputWithConfirmControlComponent),
  multi: true,
};

@Component({
  selector: 'app-input-with-confirm-control',
  templateUrl: './input-with-confirm-control.component.html',
  styleUrls: ['./input-with-confirm-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatIconModule, TranslateModule],
  providers: [CONTROL_VALUE_ACCESSOR, CONTROL_VALUE_VALIDATORS],
  standalone: true,
})
export class InputWithConfirmControlComponent implements ControlValueAccessor, Validator, OnInit {
  @Input() valueLabel: string | null = null;
  @Input() confirmLabel: string | null = null;
  @Input() valueErrorLabel: string | null = 'Password';
  @Input() valueErrorConfirmLabel: string | null = 'Confirm Password';
  @Input() type: 'text' | 'password' = 'text';
  @Input() placeholder: string | undefined = undefined;
  @Input() isRequired: boolean = false;
  @Input() required: boolean = false;
  @Input() isEmail: boolean = false;
  @Input() isHaulier: boolean = false;
  @Input() autocompleteValue: string = 'off';
  @Input() autocompleteConfirm: string = 'off';

  showValue = false;
  showConfirmValue = false;
  valueControl = new FormControl<string | null>(null);
  confirmControl = new FormControl<string | null>(null);

  onChange: ((value: string | null) => void) | undefined;
  onTouched: (() => void) | undefined;
  onValidationChange: (() => void) | undefined;

  constructor() {
    this.valueControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.updateChanges();
    });
    this.confirmControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.updateChanges();
      this.onValidationChange?.();
    });
  }

  ngOnInit(): void {
    this.showValue = this.type === 'text';
    this.showConfirmValue = this.type === 'text';

    if (this.isRequired) {
      this.valueControl.addValidators(Validators.required);
      this.confirmControl.addValidators(Validators.required);
    }

    if (this.isEmail) {
      this.valueControl.addValidators(strictEmailValidator());
      this.confirmControl.addValidators(strictEmailValidator());
    }

    this.valueControl.updateValueAndValidity();
    this.confirmControl.updateValueAndValidity();
  }

  updateChanges(): void {
    if (this.valueControl.value === this.confirmControl.value) {
      this.onChange?.(this.valueControl.value);
    } else {
      this.onChange?.(null);
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidationChange = fn;
  }

  writeValue(value: string | null): void {
    this.valueControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.isRequired && (!this.valueControl.value || !this.confirmControl.value)) {
      return { required: true };
    }
    if (this.valueControl.value !== this.confirmControl.value) {
      this.confirmControl.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      if (this.confirmControl.hasError('mismatch')) {
        this.confirmControl.setErrors(null);
      }
    }

    return null;
  }

  toggleShowValue(): void {
    this.showValue = !this.showValue;
  }

  toggleShowConfirmValue(): void {
    this.showConfirmValue = !this.showConfirmValue;
  }
}
