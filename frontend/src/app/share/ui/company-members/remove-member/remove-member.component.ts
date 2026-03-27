import { TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CompanyMemberService } from 'app/services/company-member.service';
import { formatRole } from 'app/share/utils/company-member';
import { RemoveMemberParams, SearchUsersForReassignmentItem } from 'app/types/requests/company-user-request';
import { catchError, debounceTime, EMPTY, filter, finalize, startWith, switchMap, tap } from 'rxjs';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { RemoveMemberData } from './types';

@Component({
  selector: 'app-remove-member',
  imports: [
    TranslateModule,
    TranslatePipe,
    MatRadioModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    TitleCasePipe,
    MatTooltip,
    SpinnerComponent,
  ],
  templateUrl: './remove-member.component.html',
  styleUrl: './remove-member.component.scss',
})
export class RemoveMemberComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  data = inject<RemoveMemberData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<RemoveMemberComponent>);
  private companyMemberService = inject(CompanyMemberService);
  private destroyRef = inject(DestroyRef);
  private snackbar = inject(MatSnackBar);

  readonly formatRole = formatRole;
  readonly limit = 9999;

  searchControl = new FormControl<string>('');
  selectControl = new FormControl<SearchUsersForReassignmentItem | null>(null, [Validators.required]);
  filteredUsers = signal<SearchUsersForReassignmentItem[]>([]);
  loading = signal<boolean>(false);
  submitting = signal(false);

  selectedUser = toSignal(this.selectControl.valueChanges.pipe(startWith(null)));
  readonly compareUserById = (
    user1: SearchUsersForReassignmentItem | null,
    user2: SearchUsersForReassignmentItem | null,
  ) => user1?.id === user2?.id;

  ngOnInit() {
    this.setupSearch();
    this.setupValidate();
    this.loadInitialUsers();
  }

  setupValidate() {
    this.selectControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {});
  }

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(700),
        filter((value) => typeof value === 'string'),
        tap(() => this.loading.set(true)),
        switchMap((searchTerm) =>
          this.companyMemberService
            .searchUsersForReassignment({
              search: searchTerm,
              skip: 0,
              limit: this.limit,
              companyId: this.data.companyId || undefined,
            })
            .pipe(
              catchError(() => {
                this.loading.set(false);
                return EMPTY;
              }),
            ),
        ),
      )
      .subscribe((response) => {
        this.loading.set(false);
        const users = response?.results || [];
        this.filteredUsers.set(users.filter((user) => user.id !== this.data.item.id));
      });
  }

  loadInitialUsers() {
    this.loading.set(true);
    this.companyMemberService
      .searchUsersForReassignment({ limit: this.limit, skip: 0, companyId: this.data.companyId || undefined })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.loading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        this.loading.set(false);
        const users = response?.results || [];
        this.filteredUsers.set(users.filter((user) => user.id !== this.data.item.id));
      });
  }

  onSelectOpened(opened: boolean) {
    if (opened) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      }, 100);
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  handleClose() {
    this.dialogRef.close();
  }

  handleConfirm() {
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);

    if (!this.selectControl.value) return;
    const newUserId = (this.selectControl.value as any).id;
    const oldUserId = this.data.item.id;
    const payload: RemoveMemberParams = {
      newUserId,
      oldUserId,
      companyId: this.data.companyId || undefined,
    };

    this.companyMemberService
      .removeMember(payload)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          this.snackbar.open(localized$('User removed.'));
          this.dialogRef.close({ success: true });
        },
        error: (err) => {
          const message = err?.error?.error?.message;
          if (message === 'You cannot remove the only admin user from the company') {
            this.snackbar.open(
              localized$('At least one Company Admin is required. Assign another Company Admin before removal.'),
            );
          } else {
            this.snackbar.open(localized$('Unable to remove user from the company. Please try again later.'));
          }
        },
      });
  }
}
