import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IncomingRequestItem } from 'app/types/requests/company-user-request';

import { AuthService } from 'app/services/auth.service';
import { CompanyMemberService } from 'app/services/company-member.service';
import { IncomingRowComponent } from 'app/share/ui/incoming-grow/incoming-row.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-incoming',
  imports: [TranslateModule, TranslatePipe, IncomingRowComponent, PaginationComponent, SpinnerComponent],
  templateUrl: './incoming.component.html',
  styleUrl: './incoming.component.scss',
})
export class IncomingComponent {
  page = signal(1);
  totalCount = signal(0);
  items = signal<any[]>([]);
  isLoading = signal(false);
  submitting = signal(false);
  noResults = signal(false);
  invalidPage = signal(false);
  private companyMemberService = inject(CompanyMemberService);
  private authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  private translate = inject(TranslatePipe);
  private destroyRef = inject(DestroyRef);
  pageSize = 10;

  ngOnInit() {
    this.fetchIncomingRequests();
    this.companyMemberService.memberTabRefresh$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fetchIncomingRequests());
  }

  mapLoadResponseItemToTableData(loadItem: IncomingRequestItem) {
    return {
      id: loadItem.id,
      firstName: loadItem.firstName,
      lastName: loadItem.lastName,
      email: loadItem.email,
      notes: loadItem.note,
      // Keep the original item for API operations
      originalItem: loadItem,
    };
  }

  fetchIncomingRequests() {
    this.isLoading.set(true);

    this.companyMemberService
      .getIncomingRequests({
        page: this.page(),
        limit: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((item) => this.mapLoadResponseItemToTableData(item));
          this.items.set(mapped);
          this.totalCount.set(res.totalCount);
          this.invalidPage.set(res.totalCount > 0 && mapped.length === 0);
          this.noResults.set(res.totalCount === 0 && mapped.length === 0);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(false);
          this.snackbar.open(
            this.translate.transform(localized$("We couldn't load incoming requests. Please refresh and try again.")),
          );
        },
      });
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchIncomingRequests();
  }

  onApprove(item: ReturnType<IncomingComponent['mapLoadResponseItemToTableData']>) {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);

    if (!item.originalItem) {
      console.error('Original item not found');
      return;
    }

    this.companyMemberService
      .approveIncomingRequest(item.originalItem.id)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.snackbar.open(this.translate.transform(localized$('Request approved successfully')), undefined, {
            duration: 3000,
          });

          // Refresh the list
          this.onPageChange(1);
        },
        error: (error) => {
          console.error('Error approving request:', error);
          let errorMessage = 'We could not approve this request right now. Please try again.';

          if (error?.error?.message) {
            switch (error.error.message) {
              case 'request-already-processed':
                errorMessage = 'This request has already been processed.';
                break;
              case 'request-not-found':
                errorMessage = 'Request not found.';
                break;
              default:
                errorMessage = 'We could not approve this request right now. Please try again.';
            }
          }

          this.snackbar.open(this.translate.transform(localized$(errorMessage)), undefined, { duration: 5000 });
        },
      });
  }

  onReject(item: ReturnType<IncomingComponent['mapLoadResponseItemToTableData']>) {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);

    if (!item.originalItem) {
      console.error('Original item not found');
      return;
    }

    this.companyMemberService
      .rejectIncomingRequest(item.originalItem.id)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.snackbar.open(this.translate.transform(localized$('Request rejected successfully')), undefined, {
            duration: 3000,
          });

          // Refresh the list
          this.onPageChange(1);
        },
        error: (error) => {
          console.error('Error rejecting request:', error);
          let errorMessage = 'We could not reject this request right now. Please try again.';

          if (error?.error?.message) {
            switch (error.error.message) {
              case 'request-already-processed':
                errorMessage = 'This request has already been processed.';
                break;
              case 'request-not-found':
                errorMessage = 'Request not found.';
                break;
              default:
                errorMessage = 'We could not reject this request right now. Please try again.';
            }
          }

          this.snackbar.open(this.translate.transform(localized$(errorMessage)), undefined, { duration: 5000 });
        },
      });
  }
}
