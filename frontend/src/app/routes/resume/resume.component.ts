import { Component, OnInit, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { DraftRegisterService } from 'app/services/draft-register.service';

@Component({
  selector: 'app-resume',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="resume-container">
      <mat-spinner diameter="60" color="primary"></mat-spinner>
    </div>
  `,
  styles: [
    `
      .resume-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
      }

      mat-spinner {
        --mdc-circular-progress-active-indicator-color: #28a745;
      }
    `,
  ],
})
export class ResumeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private draftService = inject(DraftRegisterService);
  private snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.handleError('This link is invalid. Please restart the registration process.');
      return;
    }

    // Use the centralized resume logic from the draft service
    this.draftService.resumeRegistrationFlow(token).subscribe();
  }

  private handleError(message: string): void {
    this.snackbar.open(message);
    this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
  }
}
