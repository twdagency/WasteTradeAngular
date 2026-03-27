import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { PermissionService } from 'app/services/permission.service';
import { get } from 'lodash';
import { map, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appPermissionTooltip]',
  hostDirectives: [MatTooltip],
  standalone: true,
  host: {},
})
export class PermissionTooltipDirective implements OnInit, OnDestroy {
  private readonly permissionService = inject(PermissionService);
  private readonly translate = inject(TranslatePipe);
  private readonly destroy$ = new Subject<void>();
  private el = inject(ElementRef);

  constructor() {
    this.el.nativeElement.style.display = 'inline-block';
    this.el.nativeElement.style.height = 'fit-content';
  }

  matTooltip = inject(MatTooltip);

  // Input for the permission key path (e.g., 'setting.cantEditCompanyDocument')
  appPermissionTooltip = input.required<string>();

  shouldShowTooltip = false;
  private readonly defaultTooltipMessage = localized$(
    'You do not have permission from your company administrator to edit company info.',
  );

  ngOnInit(): void {
    this.permissionService.permission
      .pipe(
        takeUntil(this.destroy$),
        map((permission) => {
          const permissionValue = get(permission, this.appPermissionTooltip(), false);
          return permissionValue;
        }),
      )
      .subscribe((hasNoPermission) => {
        this.shouldShowTooltip = Boolean(hasNoPermission);

        this.matTooltip.message = this.shouldShowTooltip ? this.translate.transform(this.defaultTooltipMessage) : '';
        this.matTooltip.disabled = !this.shouldShowTooltip;
        this.matTooltip.position = 'above';
        this.matTooltip.tooltipClass = 'custom-role-tooltip';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
