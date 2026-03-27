import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { CompanyLocationDetail } from 'app/models';
import { LocationService } from 'app/services/location.service';
import { ConfirmDeleteLocationModalComponent } from 'app/share/ui/confirm-delete-location-modal/confirm-delete-location-modal.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.scss'],
  imports: [MatIconModule, MatButtonModule, SpinnerComponent, TranslateModule],
  providers: [TranslatePipe],
})
export class SiteListComponent implements OnInit {
  loading = signal(false);
  locations: Signal<CompanyLocationDetail[] | undefined | null>;

  dialog = inject(MatDialog);
  router = inject(Router);
  locationService = inject(LocationService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);

  constructor() {
    this.refresh();

    this.locations = toSignal(this.locationService.location$);
  }

  ngOnInit() {}

  onDeleteLocation(location: Location, index: number) {
    this.dialog.open(ConfirmDeleteLocationModalComponent, {
      maxWidth: '400px',
      width: '100%',
      panelClass: 'px-3',
      data: {
        location,
        index,
      },
    });
  }

  onViewDetail(location: CompanyLocationDetail) {
    this.router.navigate([ROUTES_WITH_SLASH.sites, location.id]);
  }

  addNewLocation(): void {
    this.router.navigate([ROUTES_WITH_SLASH.sites, 'add']);
  }

  refresh() {
    this.loading.set(true);
    this.locationService
      .getLocations()
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((err) => {
          if (err) {
            this.snackBar.open(
              this.translate.transform(localized$('Unable to load locations. Please try again later.')),
              this.translate.transform(localized$('Ok')),
              {
                duration: 3000,
              },
            );
          }
          return of([]);
        }),
      )
      .subscribe();
  }
}
