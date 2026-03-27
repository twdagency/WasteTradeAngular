import { Component, inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { SiteDetailComponent } from 'app/routes/my-sites/site-detail/site-detail.component';
import { LocationService } from 'app/services/location.service';
import { getLocationAddress } from 'app/share/utils/offer';
import { catchError, EMPTY } from 'rxjs';
import { DialogWrapperComponent } from '../dialog-wrapper/dialog-wrapper.component';

@Component({
  selector: 'app-location-summary',
  templateUrl: './location-summary.component.html',
  styleUrls: ['./location-summary.component.scss'],
  imports: [TranslateModule],
  providers: [TranslatePipe],
})
export class LocationSummaryComponent implements OnInit {
  @Input() locationData: any;
  @Input() allowDetailsModal: boolean = false;

  address: string | null = null;
  getLocationAddress = getLocationAddress;

  private readonly dialog = inject(MatDialog);
  locationService = inject(LocationService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);

  constructor() {}

  ngOnInit() {
    if (this.locationData) {
      this.address = this.getLocationAddress(this.locationData);
    }
  }

  getLocationDetails() {
    if (this.allowDetailsModal) {
      const locationId = this.locationData?.id;
      if (!locationId) return;

      this.locationService
        .getLocationDetail(locationId)
        .pipe(
          catchError(() => {
            this.snackBar.open(
              this.translate.transform(localized$('Error occurred while loading location details.')),
              'OK',
              { duration: 3000 },
            );
            return EMPTY;
          }),
        )
        .subscribe((location) => {
          const title = `Location details - ${location?.locationName || ''}`;
          this.dialog.open(DialogWrapperComponent, {
            maxWidth: '980px',
            maxHeight: '90vh',
            width: '100%',
            autoFocus: false,
            data: {
              component: SiteDetailComponent,
              wrapperData: {
                title: title,
              },
              childData: {
                location: location,
                dialogMode: true,
              },
            },
          });
        });
    }
  }
}
