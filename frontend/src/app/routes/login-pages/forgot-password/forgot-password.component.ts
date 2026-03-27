import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { strictEmailValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { FORGOT_PASSWORD_TIME_KEY, LocalStorageService } from 'app/services/local-storage.service';
import { isNil } from 'lodash';
import moment from 'moment';
import { map, takeWhile, tap, timer } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [RouterLink, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatSnackBarModule, TranslateModule],
  providers: [TranslatePipe],
})
export class ForgotPasswordComponent implements OnInit {
  formGroup: FormGroup;
  serverError = signal('');
  submitting = signal(false);
  cooldownMessage = signal('');
  waitCooldown = signal(false);

  // private cooldownEnd$ = new BehaviorSubject<number | null>(null);
  // cooldownMessage$ = this.cooldownEnd$.pipe(
  //   // Emit every second, start immediately
  //   switchMap((end) => {
  //     if (!end) return [null];
  //     return interval(1000).pipe(
  //       startWith(0),
  //       map(() => {
  //         const now = Date.now();
  //         const diff = end - now;
  //         if (diff <= 0) return null;
  //         const minutes = Math.floor(diff / 1000 / 60);
  //         const seconds = Math.floor((diff / 1000) % 60);
  //         let msg = 'Please wait ';
  //         if (minutes > 0) msg += `${minutes} minute${minutes > 1 ? 's' : ''} `;
  //         msg += `${seconds} second${seconds !== 1 ? 's' : ''} before resending forgotten password link.`;
  //         return msg.trim();
  //       }),
  //       takeWhile(msg => msg !== null, true)
  //     );
  //   })
  // );

  router = inject(Router);
  translate = inject(TranslatePipe);
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private localStorageService: LocalStorageService,
  ) {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, strictEmailValidator()]],
    });
  }

  ngOnInit(): void {
    this.setupForm();

    this.waitCooldown.set(!this.canForgot());
    if (this.waitCooldown()) {
      this.setupCooldown();
    }
  }

  setupForm() {
    // Listen to value changes of the entire form
    this.formGroup.valueChanges.subscribe(() => {
      if (this.serverError) {
        this.serverError.set('');
      }
    });
  }

  canForgot() {
    const lastTimeForgot = this.localStorageService.getItem(FORGOT_PASSWORD_TIME_KEY);
    const forgotDateTime = lastTimeForgot ? Number(lastTimeForgot) : undefined;

    if (isNil(forgotDateTime)) {
      return true;
    }
    const now = Date.now().valueOf();

    return forgotDateTime <= now;
  }

  setupCooldown() {
    const lastTimeForgot = this.localStorageService.getItem(FORGOT_PASSWORD_TIME_KEY);
    const forgotDateTime = lastTimeForgot ? Number(lastTimeForgot) : undefined;

    if (isNil(forgotDateTime)) {
      return;
    }

    timer(0, 1000)
      .pipe(
        map(() => {
          const now = Date.now();
          if (forgotDateTime <= now) {
            return null;
          }
          const diff = Math.abs(forgotDateTime - now);
          const minutes = Math.floor(diff / 1000 / 60);
          const seconds = Math.floor((diff / 1000) % 60);

          // localized$('Please wait {{minutes}} minute(s) {{seconds}} second(s) before resending forgotten password link.', {
          //   pa
          // })
          let msg = 'Please wait ';
          if (minutes > 0) msg += `${minutes} minute${minutes > 1 ? 's' : ''} `;
          msg += `${seconds} second${seconds !== 1 ? 's' : ''} before resending forgotten password link.`;
          return msg.trim();
        }),
        tap((message) => {
          this.cooldownMessage.set(message ?? '');
          this.waitCooldown.set(!!this.cooldownMessage());
        }),
        takeWhile((message) => !!message),
      )
      .subscribe();
  }

  submit(): void {
    if (this.submitting() || this.waitCooldown()) {
      return;
    }

    this.formGroup.markAllAsTouched();
    const { email } = this.formGroup.value;

    if (!this.formGroup.valid || !email) {
      return;
    }

    this.submitting.set(true);
    this.serverError.set('');
    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.snackbar.open(
          this.translate.transform(
            localized$('Please check your email with instructions on how to reset your password.'),
          ),
        );
        this.submitting.set(false);
        this.router.navigateByUrl(ROUTES_WITH_SLASH.login);
        this.localStorageService.setItem(FORGOT_PASSWORD_TIME_KEY, moment().add(2, 'minutes').valueOf());
      },
      error: (err) => {
        if (err.status === 422) {
          this.snackbar.open(
            this.translate.transform(
              localized$('Please check your email with instructions on how to reset your password.'),
            ),
          );
        } else if (err.error.error.statusCode === 429) {
          this.snackbar.open(
            this.translate.transform(localized$('Please wait 24 hours before resending forgotten password link.')),
          );
        } else {
          this.snackbar.open(this.translate.transform(localized$('Something went wrong.')));
        }

        this.submitting.set(false);
      },
    });
  }
}
