import { Component, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AuthService, NOT_INITIAL_USER } from 'app/services/auth.service';
import { CompanyMemberService } from 'app/services/company-member.service';
import { MembersRowComponent } from 'app/share/ui/company-members/members-row/members-row.component';
import { FilterComponent } from 'app/share/ui/listing/filter/filter.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { formatRole } from 'app/share/utils/company-member';
import { CompanyUserListItem } from 'app/types/requests/company-user-request';
import { filter, forkJoin, map } from 'rxjs';
import { MemberRowItem } from './types';

@Component({
  selector: 'app-members',
  imports: [
    TranslatePipe,
    TranslateModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FilterComponent,
    MembersRowComponent,
    PaginationComponent,
    SpinnerComponent,
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
})
export class MembersComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  private companyMemberService = inject(CompanyMemberService);
  private snackbar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private translate = inject(TranslatePipe);
  private destroyRef = inject(DestroyRef);

  page = signal(1);
  totalCount = signal(0);
  items = signal<any[]>([]);
  isLoading = signal(false);
  pageSize = 20;
  actualTotalCount = signal(0);

  noResults = signal(false);
  invalidPage = signal(false);
  // Filter and search state
  currentFilters = signal<any>({});
  searchTerm = signal('');

  isHaulierCompany = toSignal(
    this.authService.user$.pipe(
      filter((user) => user !== NOT_INITIAL_USER),
      map(() => this.authService.isHaulierUser),
    ),
    {
      initialValue: false,
    },
  );

  ngOnInit() {
    this.fetchMembers();
    this.companyMemberService.memberTabRefresh$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fetchMembers());
  }

  mapLoadResponseItemToTableData(loadItem: CompanyUserListItem): MemberRowItem {
    const role = formatRole(loadItem.companyRole);

    return {
      id: loadItem.id,
      prefix: loadItem.prefix ?? '',
      firstName: loadItem.firstName,
      lastName: loadItem.lastName,
      status: loadItem.status,
      jobTitle: loadItem.jobTitle ?? '',
      email: loadItem.email,
      formatRole: role ?? '',
      // Keep original item for any future operations
      originalItem: loadItem,
    };
  }

  fetchMembers() {
    this.isLoading.set(true);

    const filters = this.currentFilters();
    const searchTerm = this.searchTerm();
    const skip = (this.page() - 1) * this.pageSize;

    const params = {
      filter: {
        skip,
        limit: this.pageSize,
        where: {
          role: filters.companyMemberRole || filters.haulierCompanyMemberRole || '',
          status: filters.companyMemberStatus || '',
        },
      },
      searchTerm: searchTerm || undefined,
    };

    const filtered$ = this.companyMemberService.getMembers(params);
    const unfiltered$ = this.companyMemberService.getMembers({
      filter: {
        skip: 0,
        limit: 1,
      },
    });

    forkJoin([filtered$, unfiltered$]).subscribe({
      next: ([filteredRes, unfilteredRes]) => {
        const mapped = filteredRes.results.map((item) => this.mapLoadResponseItemToTableData(item));
        this.items.set(mapped);
        this.totalCount.set(filteredRes.totalCount);
        this.actualTotalCount.set(unfilteredRes.totalCount);
        this.invalidPage.set(filteredRes.totalCount > 0 && filteredRes.results.length === 0);
        this.noResults.set(filteredRes.totalCount === 0 && filteredRes.results.length === 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.isLoading.set(false);
        this.snackbar.open(
          this.translate.transform(localized$('We could not load members. Please refresh and try again.')),
        );
      },
    });
  }

  search() {
    if (this.searchInput) {
      const searchValue = this.searchInput.nativeElement.value.trim();
      this.searchTerm.set(searchValue);
      this.page.set(1); // Reset to first page when searching
      this.fetchMembers();
    }
  }

  refetchMembers() {
    this.onFilterChanged({});
  }

  onFilterChanged(filter: any) {
    this.currentFilters.set(filter);
    this.page.set(1); // Reset to first page when filtering
    this.fetchMembers();
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchMembers();
  }
}
