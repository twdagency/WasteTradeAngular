import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HaulierLayoutComponent } from 'app/layout/haulier-layout/haulier-layout.component';
import {
  containerTypeList,
  euCountryList,
  fleetTypeList,
  HaulageProfile,
  WasteCarrierLicenseItem,
} from 'app/models/haulage.model';
import { AuthService } from 'app/services/auth.service';
import { HaulageService } from 'app/services/haulage.service';
import { SeoService } from 'app/services/seo.service';
import { ExpiryDatePipe } from 'app/share/pipes/expiry-date.pipe';
import { DialogWrapperComponent } from 'app/share/ui/dialog-wrapper/dialog-wrapper.component';
import { HaulierFormComponent } from 'app/share/ui/haulier/haulier-form/haulier-form.component';
import { getOfferStatusColor } from 'app/share/utils/offer';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-haulier-profile',
  templateUrl: './haulier-profile.component.html',
  styleUrls: ['./haulier-profile.component.scss'],
  imports: [
    HaulierLayoutComponent,
    TranslateModule,
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgTemplateOutlet,
    ExpiryDatePipe,
  ],
  providers: [TranslatePipe],
})
export class HaulierProfileComponent implements OnInit {
  private seoService = inject(SeoService);
  mapCountryCodeToName = mapCountryCodeToName;
  getOfferStatusColor = getOfferStatusColor;
  fleetTypeList = fleetTypeList;
  euCountries = euCountryList;
  containerTypeList = containerTypeList;

  haulier: Signal<HaulageProfile | undefined | null>;

  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  translate = inject(TranslatePipe);
  private sanitizer = inject(DomSanitizer);
  haulierService = inject(HaulageService);
  destroyRef = inject(DestroyRef);

  userInitials = computed(() => {
    const userValue = this.haulier();
    if (userValue) {
      const firstName = userValue.firstName || '';
      const lastName = userValue.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return '';
  });

  wasteCarrierLicenseDocuments = computed(() => this.haulier()?.wasteCarrierLicense ?? []);

  additionalInformation = computed(() => {
    if (!this.haulier()) return;
    const areasMap = [
      {
        value: 'worldwide',
        name: 'Worldwide',
      },
      {
        value: 'uk_only',
        name: 'UK only',
      },
    ];
    const fleetType = this.haulier()?.fleetType ?? '';
    let isCoveredEU = !['uk_only', 'worldwide'].includes(this.haulier()?.areasCovered[0] ?? '');
    const isAllContainer = this.haulier()?.containerTypes.includes('all');
    return {
      fleetType: fleetTypeList.find((t) => t.value == fleetType)?.name,
      areaCovered: isCoveredEU
        ? euCountryList.filter((c) => (this.haulier()?.areasCovered ?? []).includes(c.value)).map((c) => c.name)
        : areasMap.filter((a) => a.value == this.haulier()?.areasCovered[0]).map((a) => a.name),
      containerType: isAllContainer
        ? containerTypeList.map((t) => t.name)
        : containerTypeList.filter((c) => (this.haulier()?.containerTypes ?? []).includes(c.value)).map((c) => c.name),
    };
  });

  constructor() {
    this.refresh();
    this.haulier = toSignal(this.haulierService.haulier$);
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Haulier profile')),
      description: this.translate.transform(localized$('Haulier profile')),
    });
    this.seoService.setNoIndex();
  }

  onEditProfile() {
    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      maxWidth: '980px',
      maxHeight: '85vh',
      width: '900px',
      data: {
        component: HaulierFormComponent,
        childData: {
          dialogMode: true,
          haulierProfile: this.haulier(),
        },
        wrapperData: {
          useCloseConfirm: true,
        },
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.refresh();
        }
      });
  }

  viewDocument(item: WasteCarrierLicenseItem) {
    window.open(item.documentUrl, '_blank');
  }

  safeUrl(url: string): SafeUrl {
    if (!url) return '';

    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }

    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  refresh() {
    this.haulierService
      .getProfile()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.snackBar.open(
            this.translate.transform(localized$('We couldn’t load the profile page. Please refresh and try again.')),
          );
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
