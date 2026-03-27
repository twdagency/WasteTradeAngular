import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { strictEmailValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { addLanguagePrefix } from 'app/utils/language.utils';
import { AuthService } from '../../../services/auth.service';
import { CreateAccountModalComponent } from '../create-account-modal/create-account-modal.component';
import { AnalyticsService } from 'app/services/analytics.service';
import { GaEventName } from 'app/constants/ga-event';

export const EMAIL_PATTERN = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class LoginComponent {
  formGroup = new FormGroup({
    email: new FormControl<string | null>(null, [Validators.required, strictEmailValidator()]),
    password: new FormControl<string | null>(null, [Validators.required]),
  });

  serverError = signal('');
  submitting = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translate: TranslatePipe,
    private analyticsService: AnalyticsService,
  ) {
    this.setupForm();
  }

  setupForm() {
    // Listen to value changes of the entire form
    this.formGroup.valueChanges.subscribe(() => {
      if (this.serverError()) {
        this.serverError.set('');
      }
    });
  }

  openCreateAccountModal(): void {
    const dialogRef = this.dialog.open(CreateAccountModalComponent, {
      maxWidth: '920px',
      panelClass: 'px-2',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'buyer-seller') {
        // Handle buyer/seller registration
        this.router.navigateByUrl(addLanguagePrefix('/create-account'));
      } else if (result === 'haulier') {
        this.router.navigateByUrl(addLanguagePrefix('/create-haulier-account'));
      }
    });
  }

  send() {
    if (this.submitting()) {
      return;
    }

    this.formGroup.markAllAsTouched();

    const { email, password } = this.formGroup.value;
    if (!this.formGroup.valid || !email?.trim() || !password) {
      return;
    }

    this.submitting.set(true);
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.analyticsService.trackEvent(GaEventName.LOGIN, { method: 'email' });
        const targetRoute = this.authService.getDefaultRouteByRole();
        this.router.navigateByUrl(addLanguagePrefix(targetRoute));
      },
      error: (err) => {
        console.log(err);
        if (err?.status === 401 || err?.status === 422) {
          this.serverError.set(this.translate.transform(localized$('Invalid email address and/or password.')));
        } else {
          this.snackBar.open(this.translate.transform(localized$('Something went wrong.')));
        }
        this.submitting.set(false);
      },
    });
  }
}
