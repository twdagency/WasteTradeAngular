import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NotesModalComponent } from '../notes-modal/notes-modal/notes-modal.component';
import { NotesRefreshService } from '../service/notes-refresh.service';
import { AdminNote, AdminNoteDataType } from '../types/notes';

export type AdminNoteInputData = {
  id: number;
  dataType: AdminNoteDataType;
  adminNote?: AdminNote | null;
};

@Component({
  selector: 'app-notes-btn',
  imports: [TranslatePipe, TranslateModule, MatButtonModule, MatIconModule, MatTooltip],
  templateUrl: './notes-btn.component.html',
  styleUrl: './notes-btn.component.scss',
})
export class NotesBtnComponent {
  dialog = inject(MatDialog);
  notesRefreshService = inject(NotesRefreshService);
  inputData = input<AdminNoteInputData>();

  noteContent = computed(() => this.inputData()?.adminNote);

  openNotesModal() {
    const dialogRef = this.dialog.open(NotesModalComponent, {
      data: {
        dataId: this.inputData()?.id,
        dataType: this.inputData()?.dataType,
        adminNote: this.inputData()?.adminNote ?? null,
      },

      width: '100%',
      maxWidth: '960px',
      minHeight: '541px',
    });

    dialogRef.afterClosed().subscribe((savedNote) => {
      if (savedNote) {
        this.notesRefreshService.triggerRefresh();
      }
    });
  }
}
