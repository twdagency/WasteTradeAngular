import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AdminCommercialService } from 'app/services/admin/admin-commercial.service';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { NotesRefreshService } from 'app/share/ui/notes/service/notes-refresh.service';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { catchError, EMPTY, first, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { MfiListingItemComponent } from '../mfi-listing-item/mfi-listing-item.component';
import { ListContainerComponent } from 'app/share/ui/list-container/list-container.component';

@Component({
  selector: 'app-admin-mfi',
  templateUrl: './admin-mfi.component.html',
  styleUrls: ['./admin-mfi.component.scss'],
  imports: [
    TranslateModule,
    SpinnerComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    PaginationComponent,
    MfiListingItemComponent,
    ReactiveFormsModule,
    MatButtonModule,
    ListContainerComponent,
  ],
})
export class AdminMfiComponent implements OnInit {
  adminCommercialService = inject(AdminCommercialService);

  page = signal(1);
  pageSize = 20;
  loading = signal(true);
  snackBar = inject(MatSnackBar);
  fb = inject(FormBuilder);
  translate = inject(TranslatePipe);
  notesRefreshService = inject(NotesRefreshService);
  destroyRef = inject(DestroyRef);

  form: FormGroup = this.fb.group({
    searchTerm: [''],
  });
  updator = new Subject<void>();

  constructor() {}

  ngOnInit(): void {}
}
