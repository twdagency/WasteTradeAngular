import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { isNil } from 'lodash';
import moment, { Moment } from 'moment';

export interface FileInfo {
  file: File;
  expiryDate?: Moment | null;
}

export interface DocumentFileInfo {
  id?: number;
  documentType?: string;
  documentUrl?: string;
  documentName?: string;
  expiryDate?: string;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class FileUploadComponent implements OnInit, OnChanges {
  @Input() maxFile: number = 1;
  @Input() required: boolean = true;
  @Input() expiryDateMode: 'required' | 'optional' | 'hidden' = 'required';
  @Input() notAcceptable: string[] = []; // ex: ['.jpg', '.jpeg']
  @Input() acceptable: string[] | undefined = undefined; // ex: ['.jpg', '.jpeg']
  @Input() fileList: DocumentFileInfo[] = [];
  @Input() maxFileSize: number = 25 * 1024 * 1024;
  @Input() disabled = false;
  @Input() multi: boolean = false;

  @Output() filesAdded = new EventEmitter<FileInfo[]>();
  @Output() uploadValid = new EventEmitter<boolean>();

  @ViewChild('fileUploadInput') fileInputRef!: ElementRef<HTMLInputElement>;

  isDraggingOver = false;
  today = new Date();

  formGroup = new FormGroup({
    documents: new FormArray([], []),
  });

  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);

  get documents(): FormArray {
    return this.formGroup.get('documents') as FormArray;
  }

  baseAllowedTypes = [
    { extension: '.gif', mimeType: 'image/gif' },
    { extension: '.jpg', mimeType: 'image/jpeg' },
    { extension: '.jpeg', mimeType: 'image/jpeg' },
    { extension: '.png', mimeType: 'image/png' },
    { extension: '.pdf', mimeType: 'application/pdf' },
    { extension: '.doc', mimeType: 'application/msword' },
    {
      extension: '.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    { extension: '.xls', mimeType: 'application/vnd.ms-excel' },
    {
      extension: '.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  ];
  constructor() {
    this.today.setDate(this.today.getDate() - 0);
    this.documents.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.documents.valid) {
        if (this.required && this.documents.length > 0) {
          this.uploadValid.emit(true);
          this.filesAdded.emit(this.getFileInfos());
          return;
        }
      }
      if (this.documents.length == 0) {
        this.filesAdded.emit(this.getFileInfos());
      }
      this.uploadValid.emit(false);
    });
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileList']) {
      this.patchFilesFromInput();
    }
  }

  private patchFilesFromInput() {
    if (this.documents.length) {
      this.documents.clear();
    }
    if (this.fileList && this.fileList.length > 0) {
      this.fileList.forEach((file) => {
        const fileName = file.documentName
          ? file.documentName
          : file.documentUrl
            ? this.extractFileName(file.documentUrl)
            : '';

        const expiryDate = file.expiryDate ? moment(file.expiryDate, ['DD/MM/YYYY', 'YYYY-MM-DD']).toDate() : null;

        const fileControl = new FormGroup({
          fileName: new FormControl(fileName),
          fileId: new FormControl(file.id ?? null),
          documentUrl: new FormControl(file.documentUrl ?? ''),
          documentType: new FormControl(file.documentType ?? ''),
          expiryDate: new FormControl(expiryDate),
        });
        this.documents.push(fileControl);
      });
    }
  }

  extractFileName(url: string): string {
    return url.split('/').pop() || '';
  }

  handleUploadFile(event: MouseEvent) {
    if (this.disabled) return;
    this.preventAndStopEvent(event);
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.click();
    }
  }

  onFileSelected(event: any): void {
    if (this.disabled) return;
    const fileInput = event.target as HTMLInputElement;
    this.processFiles(fileInput.files);
    fileInput.value = '';
  }

  onDragOver(event: DragEvent): void {
    this.preventAndStopEvent(event);
    if (this.disabled) return;
    this.isDraggingOver = true;
  }

  onDragLeave(event: DragEvent): void {
    this.preventAndStopEvent(event);
    if (this.disabled) return;
    this.isDraggingOver = false;
  }

  onDrop(event: DragEvent): void {
    this.preventAndStopEvent(event);
    if (this.disabled) return;
    this.isDraggingOver = false;
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFiles(files);
    }
  }

  private processFiles(files: FileList | null): void {
    if (this.documents.length >= this.maxFile) {
      this.snackBar.open(this.translate.transform(localized$(`Only accept ${this.maxFile} file(s) upload`)));
      return;
    }

    // const maxSizeInBytes = 25 * 1024 * 1024;
    const allowedMimeType = this.baseAllowedTypes
      .filter((type) => !this.notAcceptable.includes(type.extension))
      .filter((type) => {
        if (isNil(this.acceptable)) {
          return true;
        }

        return this.acceptable.includes(type.extension);
      })
      .map((type) => type.mimeType);

    if (!files || files.length === 0) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedMimeType.includes(file.type)) {
        this.snackBar.open(
          this.translate.transform(
            localized$(`Invalid file type uploaded. Please upload the document in one of the supported formats`),
          ),
        );
        continue;
      }

      if (file.size > this.maxFileSize) {
        this.snackBar.open(
          this.translate.transform(
            localized$(
              `File size is too large. Please upload a file smaller than ${this.maxFileSize / 1024 / 1024}MB.`,
            ),
          ),
        );
        continue;
      }

      this.addNewFileControl(file, this.expiryDateMode);
    }
  }

  private addNewFileControl(file: File, expiryDateMode: string) {
    const validators = [];

    if (this.expiryDateMode === 'required') {
      validators.push(Validators.required);
    }

    const fileControl = new FormGroup({
      file: new FormControl<File>(file),
      expiryDate: new FormControl<Moment | null>(null, validators),
    });
    this.documents.push(fileControl);
  }

  private getFileInfos(): FileInfo[] {
    return this.documents.value;
  }

  remove(fileIndex: number) {
    if (this.disabled) {
      return;
    }

    this.documents.removeAt(fileIndex);
  }

  preventAndStopEvent(event: DragEvent | MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
