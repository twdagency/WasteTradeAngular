import { Component, effect, inject, Injector } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { startWith } from 'rxjs';

interface Option {
  label: string;
  value: RequestInfo;
}

enum RequestInfo {
  Additional = 'Additional company documentation required',
  Clarification = 'Clarification on provided details',
  UpdateON = 'Update on business address',
  Other = 'Other (Provide a custom request)',
}

@Component({
  selector: 'app-admin-haulage-request-info',
  templateUrl: './admin-haulage-request-info.component.html',
  styleUrls: ['./admin-haulage-request-info.component.scss'],
  imports: [
    FormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
    TranslateModule,
  ],
})
export class AdminHaulageRequestInfoComponent {
  RequestInfo = RequestInfo;

  injector = inject(Injector);

  requestInfo: Option[] = [
    {
      label: localized$('Additional company documentation required'),
      value: RequestInfo.Additional,
    },
    {
      label: localized$('Clarification on provided details'),
      value: RequestInfo.Clarification,
    },
    {
      label: localized$('Update on business address'),
      value: RequestInfo.UpdateON,
    },
    {
      label: localized$('Other (Provide a custom request)'),
      value: RequestInfo.Other,
    },
  ];

  requestInfoForm = new FormGroup({
    requestInfo: new FormControl<RequestInfo | null>(null, [Validators.required]),
    message: new FormControl<string | null>(null),
  });

  private requestInfoSignal = toSignal(
    this.requestInfoForm
      .get('requestInfo')!
      .valueChanges.pipe(startWith(this.requestInfoForm.get('requestInfo')!.value)),
    { initialValue: null as RequestInfo | null },
  );

  constructor(private dialogRef: MatDialogRef<AdminHaulageRequestInfoComponent>) {
    const messageCtrl = this.requestInfoForm.get('message')!;

    effect(() => {
      const selected = this.requestInfoSignal();

      queueMicrotask(() => {
        if (selected === RequestInfo.Other) {
          messageCtrl.setValidators([Validators.required]);
        } else {
          messageCtrl.clearValidators();
        }

        messageCtrl.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  confirm(): void {
    if (this.requestInfoForm.invalid) {
      this.requestInfoForm.markAllAsTouched();
      return;
    }

    const { message, requestInfo } = this.requestInfoForm.value;
    const params = {
      message: requestInfo !== RequestInfo.Other ? requestInfo : message,
    };

    this.dialogRef.close(params);
  }

  close(): void {
    this.dialogRef.close();
  }
}
