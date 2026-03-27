import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-time-input-form-control',
  templateUrl: './time-input-form-control.component.html',
  styleUrls: ['./time-input-form-control.component.scss'],
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, TranslateModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeInputFormControlComponent),
      multi: true,
    },
  ],
})
export class TimeInputFormControlComponent implements OnInit, ControlValueAccessor {
  @Input() minHour = 0;
  @Input() maxHour = 23;
  @Input() minMinute = 0;
  @Input() maxMinute = 59;
  @Input() required: boolean = false;

  private onTouched: () => void = () => {};
  private onChanged: (value: string | null) => void = () => {};

  formGroup = new FormGroup({
    hour: new FormControl<number | null>(null, [Validators.min(this.minHour), Validators.max(this.maxHour)]),
    minute: new FormControl<number | null>(null, [Validators.min(this.minMinute), Validators.max(this.maxMinute)]),
  });

  constructor() {
    this.formGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe((value: any) => {
      const timeString = [value?.hour, value?.minute, '00'].join(':');
      if (this.formGroup.invalid) {
        this.onChanged(null);
      } else {
        this.onChanged(timeString);
      }
    });
  }

  ngOnInit() {
    if (this.required) {
      this.formGroup.get('hour')?.addValidators(Validators.required);
      this.formGroup.get('minute')?.addValidators(Validators.required);
    } else {
      this.formGroup.get('hour')?.clearValidators();
      this.formGroup.get('minute')?.clearValidators();
    }

    this.formGroup.updateValueAndValidity();
  }

  writeValue(value: string | null): void {
    if (value) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);
        this.formGroup.setValue(
          {
            hour: isNaN(hour) ? null : hour,
            minute: isNaN(minute) ? null : minute,
          },
          { emitEvent: false },
        );
      } else {
        this.formGroup.setValue({ hour: null, minute: null }, { emitEvent: false });
      }
    } else {
      this.formGroup.setValue({ hour: null, minute: null }, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  markAsTouched() {
    this.onTouched();
  }
}
