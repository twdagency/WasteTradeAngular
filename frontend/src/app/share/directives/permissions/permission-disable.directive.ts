import { Directive, inject, input, OnDestroy, OnInit } from '@angular/core';
import { PermissionService } from 'app/services/permission.service';
import { get } from 'lodash';
import { map, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appPermissionDisable]',
  standalone: true,
  host: {
    '[attr.disabled]': 'isDisabled || null',
    '[style.pointer-events]': 'isDisabled ? "none" : null',
    '[style.opacity]': 'isDisabled ? "0.5" : null',
    '[style.cursor]': 'isDisabled ? "not-allowed" : null',
  },
})
export class PermissionDisableDirective implements OnInit, OnDestroy {
  private readonly permissionService = inject(PermissionService);
  private readonly destroy$ = new Subject<void>();

  // Input for the permission key path (e.g., 'setting.cantEditCompanyDocument')
  appPermissionDisable = input.required<string>();

  isDisabled = false;

  ngOnInit(): void {
    this.permissionService.permission
      .pipe(
        takeUntil(this.destroy$),
        map((permission) => {
          const permissionValue = get(permission, this.appPermissionDisable(), false);
          return permissionValue;
        }),
      )
      .subscribe((hasNoPermission) => {
        this.isDisabled = Boolean(hasNoPermission);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
