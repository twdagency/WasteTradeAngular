import { Component, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MemberDetail } from 'app/models/admin/commercial.model';
import { CompanyMember } from 'app/models/company-member';
import { AuthService } from 'app/services/auth.service';
import { CompanyMemberService } from 'app/services/company-member.service';
import {
  MergeCompanyModalComponent,
  MergeCompanyModalData,
} from 'app/share/ui/admin/merge-company-modal/merge-company-modal.component';
import {
  ReviewMergeModalComponent,
  ReviewMergeModalData,
} from 'app/share/ui/admin/review-merge-modal/review-merge-modal.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { AdminMembersRowComponent } from './components/admin-members-row/admin-members-row.component';
import { TableRowItem } from './types/index.types';

@Component({
  selector: 'app-admin-members',
  imports: [TranslateModule, TranslatePipe, AdminMembersRowComponent, PaginationComponent, MatButtonModule],
  templateUrl: './admin-members.component.html',
  styleUrl: './admin-members.component.scss',
})
export class AdminMembersComponent {
  page = signal(1);
  totalCount = signal(1);
  items = signal<any[]>([]);

  user = input.required<MemberDetail>();

  private companyMemberService = inject(CompanyMemberService);
  private authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  private translate = inject(TranslatePipe);
  private dialog = inject(MatDialog);
  reFetchMemberDetail = output<void>();
  pageSize = 5;

  role = signal<'haulier' | 'trader'>(this.authService.isHaulierUser ? 'haulier' : 'trader');
  constructor() {}

  ngOnInit() {
    this.fetchMembers();
  }

  mapLoadResponseItemToTableData(member: CompanyMember): TableRowItem {
    const formatRole = (() => {
      switch (member.companyRole) {
        case CompanyUserRequestRoleEnum.BOTH:
          return localized$('Dual');
        case CompanyUserRequestRoleEnum.BUYER:
          return localized$('Buyer');
        case CompanyUserRequestRoleEnum.HAULIER:
          return localized$('Haulier');
        case CompanyUserRequestRoleEnum.SELLER:
          return localized$('Seller');
        case CompanyUserRequestRoleEnum.ADMIN:
          return localized$('Company admin');
        default:
          return '-';
      }
    })();

    return {
      ...member,
      role: formatRole,
      originalRole: member.companyRole,
      isHaulierCompany: member.companyData.isHaulier,
      originalData: member,
    };
  }

  fetchMembers() {
    const skip = (this.page() - 1) * this.pageSize;

    const params = {
      filter: {
        skip,
        limit: this.pageSize,
        where: {
          companyId: this.user().companyId,
        },
      },
    };

    this.companyMemberService.getMembers(params).subscribe({
      next: (res) => {
        const mapped = res.results.map((item) => this.mapLoadResponseItemToTableData(item));
        this.items.set(mapped);
        this.totalCount.set(res.totalCount);
      },
      error: (error) => {
        console.error(error);
        this.snackbar.open(
          this.translate.transform(localized$('We could not load members. Please refresh and try again.')),
        );
      },
    });
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchMembers();
  }

  refetchMembers() {
    this.onPageChange(1);
  }

  onMergeCompany() {
    // Get current company data from user input
    const currentUser = this.user();

    if (!currentUser?.companyId) {
      this.snackbar.open(
        this.translate.transform(localized$('Unable to load company information. Please try again.')),
        undefined,
        { duration: 5000 },
      );
      return;
    }

    const mergeModalData: MergeCompanyModalData = {
      company: {
        id: currentUser.companyId,
        name: currentUser.company.name,
        vatNumber: currentUser.company.vatNumber || '',
        country: currentUser.company.country || '',
        isHaulier: currentUser.company.isHaulier || false,
      },
    };

    // Open merge company modal
    const mergeDialogRef = this.dialog.open(MergeCompanyModalComponent, {
      data: mergeModalData,
      width: '100%',
      maxWidth: '960px',
    });

    mergeDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Open review merge modal
        const reviewModalData: ReviewMergeModalData = {
          masterCompany: result.masterCompany,
          mergedCompany: result.mergedCompany,
          masterChoice: result.masterChoice,
        };

        const reviewDialogRef = this.dialog.open(ReviewMergeModalComponent, {
          data: reviewModalData,
          width: '100%',
          maxWidth: '960px',
          maxHeight: '80vh',
        });

        reviewDialogRef.afterClosed().subscribe((mergeResult) => {
          if (mergeResult?.success) {
            // Refresh the members list after successful merge
            this.refetchMembers();
            this.reFetchMemberDetail.emit();
          }
        });
      }
    });
  }
}
