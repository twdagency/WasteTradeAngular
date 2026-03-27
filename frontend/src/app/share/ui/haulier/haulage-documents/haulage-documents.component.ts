import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { HaulageDocumentItem } from 'app/models/haulage.model';
import { HaulageService } from 'app/services/haulage.service';
import { catchError, finalize, of } from 'rxjs';
import { SpinnerComponent } from '../../spinner/spinner.component';

@Component({
  selector: 'app-haulage-documents',
  templateUrl: './haulage-documents.component.html',
  styleUrls: ['./haulage-documents.component.scss'],
  imports: [TranslateModule, IconComponent, MatDialogModule, MatTableModule, SpinnerComponent, RouterModule],
  providers: [TranslatePipe],
})
export class HaulageDocumentsComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<any>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  haulageService = inject(HaulageService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);

  loading = signal(false);
  tableData = signal<HaulageDocumentItem[]>([]);

  displayedColumns: string[] = ['title', 'link'];

  constructor() {}

  ngOnInit() {
    this.getHaulageDocuments();
  }

  getHaulageDocuments() {
    if (!this.data.haulageOfferId) return;
    this.loading.set(true);
    this.haulageService
      .getDocuments(this.data.haulageOfferId)
      .pipe(
        catchError(() => {
          this.snackBar.open(
            this.translate.transform(localized$('We couldn’t load documents. Please refresh and try again.')),
            'OK',
            {
              duration: 3000,
            },
          );
          return of([]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((documents) => {
        this.tableData.set(documents);
      });
  }

  openLink(url: string) {
    if (!url) return;
    window.open(url, '_blank');
  }
}
