import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { countries } from '../../../statics/country-data';

@Component({
  selector: 'app-telephone-form-control',
  templateUrl: './telephone-form-control.component.html',
  styleUrls: ['./telephone-form-control.component.scss'],
  imports: [MatFormFieldModule, MatSelectModule, ReactiveFormsModule, MatInputModule, TranslateModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TelephoneFormControlComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TelephoneFormControlComponent),
      multi: true,
    },
  ],
})
export class TelephoneFormControlComponent implements OnInit, ControlValueAccessor, Validators {
  @Input() isRequired: boolean = false;
  @Input() label: string = 'TELEPHONE';
  @Input() isHalf: boolean = false;
  @Input() disabled: boolean = false;
  countryList = countries;

  countryCodeControl = new FormControl<any | null>(null);
  telephoneControl = new FormControl<string | null>(null, [Validators.maxLength(15), Validators.pattern(/^\d*$/)]);

  onChange: ((value: any) => void) | undefined;
  onTouched: (() => void) | undefined;
  onValidatorChange?: () => void;

  constructor() {
    this.telephoneControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.onChange) {
        this.onChange(this.getValue());
        this.onValidatorChange?.();
      }
    });
    this.countryCodeControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.onChange) {
        this.onChange(this.getValue());
        this.onValidatorChange?.();
      }
    });
  }

  ngOnInit() {
    if (this.isRequired) {
      this.countryCodeControl.setValidators(Validators.required);
      this.telephoneControl.addValidators([Validators.required]);
    }

    this.countryCodeControl.updateValueAndValidity();
    this.telephoneControl.updateValueAndValidity();

    if (this.disabled) {
      this.countryCodeControl.disable();
      this.telephoneControl.disable();
    }
  }

  writeValue(value: any): void {
    let countryObject: any = null;
    let telephone: string | null = null;

    if (typeof value === 'string' && value) {
      const spaceIndex = value.indexOf(' ');
      let countryCodeStr: string | null = null;

      if (spaceIndex > 0) {
        countryCodeStr = value.substring(0, spaceIndex);
        telephone = value.substring(spaceIndex + 1).trim();
        countryObject = this.countryList.find((c) => c.code.trim() === countryCodeStr);
      } else {
        telephone = value.trim();
        countryObject = null;
      }
    } else {
      const defaultCountryCodeValue = 'United Kingdom';
      countryObject = this.countryList.find((i) => i.name.trim() == defaultCountryCodeValue);
      if (!countryObject) {
        countryObject = null;
      }
      telephone = null;
    }
    this.countryCodeControl.setValue(countryObject, { emitEvent: false });
    this.telephoneControl.setValue(telephone, { emitEvent: false });
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const errors: ValidationErrors = {};
    if (this.countryCodeControl.errors) {
      errors['countryCode'] = this.countryCodeControl.errors;
    }
    if (this.telephoneControl.errors) {
      errors['telephone'] = this.telephoneControl.errors;
    }
    return Object.keys(errors).length ? errors : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  getValue() {
    const country = this.countryCodeControl.value;
    const telephone = this.telephoneControl.value;
    if (!country || !telephone) {
      return null;
    }
    return `${country.code} ${telephone}`;
  }
}
