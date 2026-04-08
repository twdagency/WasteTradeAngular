import { afterNextRender, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { AuthService } from 'app/services/auth.service';
import { SeoService } from 'app/services/seo.service';
import { filter, tap } from 'rxjs';
import { ListWantedMaterialFormComponent } from './list-wanted-material-form/list-wanted-material-form.component';
import { SellLisingMaterialFormComponent } from './sell-lising-material-form/sell-lising-material-form.component';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.component.html',
  styleUrls: ['./create-listing.component.scss'],
  imports: [
    CommonLayoutComponent,
    MatTabsModule,
    RouterModule,
    TranslateModule,
    MatSnackBarModule,
    SellLisingMaterialFormComponent,
    ListWantedMaterialFormComponent,
  ],
  providers: [TranslatePipe],
})
export class CreateListingComponent implements OnInit {
  type: 'sell' | 'wanted' = 'sell';
  mode: 'create' | 'edit' = 'create';

  listingId: number | null = null;

  router = inject(Router);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  snackbar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  private seoService = inject(SeoService);

  loading = signal(true);

  constructor() {
    afterNextRender(() => this.syncFromLeafRoute());

    this.authService.accountStatus
      .pipe(
        filter((accountStatus) => !!accountStatus),
        tap((value) => {
          this.loading.set(!!value);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.syncFromLeafRoute());
  }

  ngOnInit() {
    this.syncFromLeafRoute();
  }

  /**
   * Reads `type`, `mode`, and `id` from the deepest activated child. The lazy
   * `loadComponent` child may not exist on the first `ngOnInit` tick; `afterNextRender`
   * and `NavigationEnd` re-run this so `[listingId]` reaches the embedded form.
   */
  private syncFromLeafRoute() {
    let currentRoute: ActivatedRoute = this.route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const data = currentRoute.snapshot.data;
    this.type = data['type'] ?? 'sell';
    this.mode = data['mode'] ?? 'create';
    const id = currentRoute.snapshot.paramMap.get('id');
    this.listingId = id ? Number(id) : null;
    this.updateSeo();
  }

  private updateSeo() {
    const title =
      this.mode === 'edit'
        ? this.translate.transform(localized$('Edit Listing'))
        : this.translate.transform(
            this.type === 'sell' ? localized$('Sell') : localized$('Create Wanted Listing'),
          );

    this.seoService.updateMetaTags({ title });
    this.seoService.setNoIndex();
  }
}
