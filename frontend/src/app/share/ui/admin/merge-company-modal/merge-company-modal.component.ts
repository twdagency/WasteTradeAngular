import { TitleCasePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AdminUserService } from 'app/services/admin/admin-user.service';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { SpinnerComponent } from '../../spinner/spinner.component';

export interface MergeCompanyModalData {
  company: {
    id: number;
    name: string;
    vatNumber: string;
    country: string;
    isHaulier: boolean;
  };
}

export interface CompanySearchResult {
  id: number;
  name: string;
  vatNumber: string | null;
  country: string | null;
  status: string;
  companyInterest: string;
  isHaulier: boolean;
  isBuyer: boolean;
  isSeller: boolean;
}

@Component({
  selector: 'app-merge-company-modal',
  standalone: true,
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
    SpinnerComponent,
  ],
  templateUrl: './merge-company-modal.component.html',
  styleUrl: './merge-company-modal.component.scss',
})
export class MergeCompanyModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<MergeCompanyModalComponent>);
  private adminUserService = inject(AdminUserService);
  private translate = inject(TranslatePipe);
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  data: MergeCompanyModalData = inject(MAT_DIALOG_DATA);
  private readonly limit = 5;

  // Form controls
  searchControl = new FormControl('');
  selectControl = new FormControl<CompanySearchResult | null>(null);
  masterChoiceControl = new FormControl('target'); // 'target' or 'source'

  // State
  searchResults = signal<CompanySearchResult[]>([]);
  loading = signal(false);
  selectedCompany = toSignal(this.selectControl.valueChanges);

  ngOnInit() {
    this.setupSearch();
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => this.searchCompanies(searchTerm || '')),
      )
      .subscribe((results) => {
        this.searchResults.set(results);
      });
  }

  private searchCompanies(searchTerm: string) {
    this.loading.set(true);

    const params = {
      skip: 0,
      limit: this.limit,
      where: {
        isHaulier: this.data.company.isHaulier,
        searchTerm: searchTerm.trim(),
      },
    };

    return this.adminUserService.searchCompaniesForMerge(params).pipe(
      map((response) => {
        this.loading.set(false);
        // Filter out the current company from results
        return response.results.filter((company) => company.id !== this.data.company.id);
      }),
    );
  }

  onSelectOpened(opened: boolean) {
    if (opened) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      }, 100);
    } else {
      this.searchControl.setValue('');
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onContinue() {
    const selectedCompany = this.selectedCompany();
    if (!selectedCompany) {
      return;
    }

    const masterChoice = this.masterChoiceControl.value;

    // Determine master and merged company based on user choice
    const mergeData = {
      masterCompany: masterChoice === 'target' ? this.data.company : selectedCompany,
      mergedCompany: masterChoice === 'target' ? selectedCompany : this.data.company,
      masterChoice,
    };

    this.dialogRef.close(mergeData);
  }

  get canContinue(): boolean {
    return !!this.selectControl.value && !!this.masterChoiceControl.value;
  }

  handleClose() {
    this.dialogRef.close();
  }
}
