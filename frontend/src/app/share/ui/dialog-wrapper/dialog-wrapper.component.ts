import { NgComponentOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  DestroyRef,
  inject,
  Injector,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss'],
  imports: [FormsModule, IconComponent, MatDialogModule, TranslateModule, NgComponentOutlet],
  providers: [TranslatePipe],
})
export class DialogWrapperComponent implements OnInit, AfterViewInit {
  hasChanges: boolean = false;

  childComponent: Type<any> | null = null;
  childInjector: Injector;

  readonly dialogRef = inject(MatDialogRef<any>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  private parentInjector = inject(Injector);

  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  wrapperData = this.data?.wrapperData;
  useCloseConfirm = this.wrapperData?.useCloseConfirm;

  @ViewChild('child', { read: ViewContainerRef }) child!: ViewContainerRef;

  constructor() {
    this.childComponent = this.data.component;

    this.childInjector = Injector.create({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: this.data?.childData ?? {} },
        { provide: MatDialogRef, useValue: this.dialogRef },
      ],
      parent: this.parentInjector,
    });
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.loadChildComponent();
  }

  loadChildComponent() {
    this.child.clear();
    if (!this.childComponent) return;
    const compRef: ComponentRef<any> = this.child.createComponent(this.childComponent, {
      injector: this.childInjector,
    });

    const instance = compRef.instance as any;

    if (instance.hasChange) {
      instance.hasChange.subscribe((value: any) => {
        this.hasChanges = value;
      });
    }
  }

  close() {
    if (this.hasChanges) {
      return this.dialog
        .open(ConfirmModalComponent, {
          maxWidth: '500px',
          width: '100%',
          panelClass: 'px-3',
          data: {
            title: 'You have unsaved changes. Are you sure you want to close without saving?',
            confirmLabel: 'Confirm',
            cancelLabel: 'Cancel',
          },
        })
        .afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((close) => {
          if (!close) return;

          this.dialogRef.close(false);
        });
    }
    this.dialogRef.close(null);
    return;
  }
}
