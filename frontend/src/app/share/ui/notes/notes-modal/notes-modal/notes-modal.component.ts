import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import moment from 'moment';
import { finalize } from 'rxjs';
import { NotesService } from '../../service/notes.service';
import { AdminNoteDetail, GetNotes, NotesModalData } from '../../types/notes';
@Component({
  selector: 'app-notes-modal',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    TranslatePipe,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  templateUrl: './notes-modal.component.html',
  styleUrl: './notes-modal.component.scss',
  providers: [NotesService],
})
export class NotesModalComponent {
  private notesService = inject(NotesService);
  private dialogRef = inject(MatDialogRef<NotesModalComponent>);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);
  private data = inject<NotesModalData>(MAT_DIALOG_DATA);
  private translate = inject(TranslateService);
  hasAdminNoteDetail = signal(false);
  noteForm = this.fb.group({
    note: ['', Validators.required],
  });

  note?: GetNotes;

  submitting = false;

  mapNotesDataToTableData(noteData: AdminNoteDetail): GetNotes {
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      return moment(dateStr).format('DD/MM/YYYY, hh:mm.');
    };
    return {
      note: noteData.value,
      updatedBy: `${noteData.updatedBy.firstName} ${noteData.updatedBy.lastName}`,
      updatedAt: `${formatDate(noteData.updatedAt)}`,
    };
  }

  ngOnInit() {
    this.notesService
      .getAdminNoteDetail(this.data.dataType, this.data.dataId)
      .pipe(
        finalize(() => {
          this.hasAdminNoteDetail.set(true);
        }),
      )
      .subscribe({
        next: (res) => {
          const detail = res.data;
          this.note = this.mapNotesDataToTableData(detail);
          this.noteForm.patchValue({
            note: detail.value,
          });
        },
        error: (err) => {
          const message =
            err?.error?.message || this.translate.instant(localized$('We couldn’t load your note. Please try again.'));
          this.snackbar.open(message);
        },
      });
  }

  onSave(): void {
    if (this.noteForm.invalid || this.submitting) return;
    this.submitting = true;
    this.notesService
      .saveAdminNote({
        dataId: this.data.dataId,
        dataType: this.data.dataType,
        value: this.noteForm.value.note!,
      })
      .subscribe({
        next: (note) => {
          this.snackbar.open('Saved successfully');
          this.dialogRef.close(note);
        },
        error: (err) => {
          this.submitting = false;
          const message =
            err?.error?.message || this.translate.instant(localized$("We couldn't save your note. Please try again."));
          this.snackbar.open(message);
        },
      });
  }
  handleClose() {
    this.dialogRef.close();
  }
}
