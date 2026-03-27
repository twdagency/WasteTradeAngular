import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reject-reason',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  templateUrl: './reject-reason.component.html',
  styleUrl: './reject-reason.component.scss',
})
export class RejectReasonComponent {
  rejectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RejectReasonComponent>,
  ) {
    this.rejectForm = this.fb.group({
      reason: [
        '',
        [
          Validators.required,
          Validators.maxLength(500),
          this.noEmailValidator(),
          this.noPhoneValidator(),
          this.noUrlValidator(),
        ],
      ],
    });
  }

  private noEmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const valid = !emailRegex.test(control.value);
      return valid ? null : { containsEmail: true };
    };
  }

  private noPhoneValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneRegex = /[\+]?\d{10,}/;
      const valid = !phoneRegex.test(control.value);
      return valid ? null : { containsPhone: true };
    };
  }

  private noUrlValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const urlRegex = /(https?:\/\/[^\s]+)|([w]{3}\.[^\s]+\.[^\s]+)/;
      const valid = !urlRegex.test(control.value);
      return valid ? null : { containsUrl: true };
    };
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.rejectForm.valid) {
      this.dialogRef.close(this.rejectForm.value.reason);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
