import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';
import { filter } from 'rxjs';

const ListTab = [
  { title: localized$('PURCHASES'), path: 'purchases' },
  { title: localized$('LISTINGS'), path: 'listings' },
  { title: localized$('WANTED'), path: 'wanted' },
];
@Component({
  selector: 'app-live-active-table',
  templateUrl: './live-active-table.component.html',
  styleUrls: ['./live-active-table.component.scss'],
  imports: [AdminLayoutComponent, MatTabsModule, RouterModule, TranslateModule],
})
export class LiveActiveTableComponent implements OnInit {
  selectedIndex = 0;

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);

  listTab = ListTab;

  constructor() {}

  ngOnInit() {
    this.selectedIndex = this.indexOfTab;
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.selectedIndex = this.indexOfTab;
      });
  }

  get indexOfTab(): number {
    const routes = Object.values(this.listTab).map((tab) => tab.path);
    const child = this.activatedRoute.firstChild;
    const tabName = child?.snapshot.url[0]?.path;

    if (tabName) {
      return routes.indexOf(tabName);
    }
    return 0;
  }

  onTabChange(event: MatTabChangeEvent) {
    const segment = this.listTab[event.index].path;
    this.router.navigate([segment], { relativeTo: this.activatedRoute });
  }
}
