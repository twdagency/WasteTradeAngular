import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  Signal,
  signal,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { User } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { SeoService } from 'app/services/seo.service';
import { ItemOf } from 'app/types/utils';
import { TabContainerComponent } from '../account-settings/tab-container/tab-container.component';

const ListTab = [
  {
    icon: 'account_circle',
    title: localized$('My profile'),
    path: 'profile',
    loadComponent: () =>
      import('../account-settings/my-profile/my-profile.component').then((m) => m.MyProfileComponent),
  },
  {
    icon: 'info',
    title: localized$('Company information'),
    path: 'company-information',
    loadComponent: () => import('../account-settings/info/info.component').then((m) => m.InfoComponent),
  },
  {
    icon: 'filter_list',
    title: localized$('Material preferences'),
    path: 'materials',
    loadComponent: () => import('../account-settings/material/material.component').then((m) => m.MaterialComponent),
  },
  {
    icon: 'notifications_active',
    title: localized$('Notifications'),
    path: 'notifications',
    loadComponent: () =>
      import('../account-settings/notification/notification.component').then((m) => m.NotificationComponent),
  },
  {
    icon: 'assignment',
    title: localized$('Company documents'),
    path: 'documents',
    loadComponent: () => import('../account-settings/document/document.component').then((m) => m.DocumentComponent),
  },
  {
    icon: 'location_on',
    title: localized$('My sites'),
    path: 'locations',
    loadComponent: () => import('../my-sites/site-list/site-list.component').then((m) => m.SiteListComponent),
  },
] as const;

type TabKey = ItemOf<typeof ListTab>['title'];

@Component({
  selector: 'app-account-setting',
  imports: [CommonLayoutComponent, MatIconModule, MatTabsModule, TabContainerComponent, TranslateModule],
  templateUrl: './account-setting.component.html',
  styleUrl: './account-setting.component.scss',
  providers: [TranslatePipe],
})
export class AccountSettingComponent implements OnInit, AfterViewInit {
  @ViewChild('tabContent', { read: ViewContainerRef }) tabContent!: ViewContainerRef;

  activeTab = signal<number | undefined>(0);

  listTab = ListTab;

  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  user: Signal<User | undefined | null>;
  loading = computed(() => !this.user());
  private isAfterViewInit = false;

  constructor() {
    this.user = toSignal(this.authService.user$);

    if (!this.user) {
      this.snackBar.open(
        this.translate.transform(localized$('Failed to load profile details. Please try again later.')),
        this.translate.transform(localized$('OK')),
        {
          duration: 3000,
        },
      );
    }
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Settings')),
      description: this.translate.transform(
        localized$(
          'See here all the settings for the profile. Here you can see the settings like My Profile, Company Info, Company Documents, and many more. Contact us today!',
        ),
      ),
    });
    this.seoService.setNoIndex();

    // Subscribe to query params changes to handle tab switching
    // takeUntilDestroyed will automatically unsubscribe when component is destroyed
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const tabIndexParam = params.get('tabIndex');
      if (tabIndexParam !== null) {
        const tabIndex = parseInt(tabIndexParam, 10);
        if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < this.listTab.length) {
          this.activeTab.set(tabIndex);
          // Only load the component if the view has been initialized
          // This prevents double loading (once here, once in ngAfterViewInit)
          if (this.isAfterViewInit && this.tabContent) {
            this.loadTabComponent(tabIndex);
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    // Mark that view is initialized
    this.isAfterViewInit = true;
    // Load the tab based on activeTab signal (which might be set from query params)
    this.loadTabComponent(this.activeTab()!);
  }

  async selectTab(key: TabKey) {
    const index = ListTab.findIndex((i) => i.title === key);
    this.activeTab.set(index);
    // Update query params to keep URL in sync
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tabIndex: index },
      queryParamsHandling: 'merge',
    });
    await this.loadTabComponent(index);
  }

  closeTab() {
    this.activeTab.set(undefined);
    // Update query params to reflect going back to main menu
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  async onTabChange(event: MatTabChangeEvent) {
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      return;
    }
    // Update query params to keep URL in sync
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tabIndex: event.index },
      queryParamsHandling: 'merge',
    });
  }

  private async loadTabComponent(index: number) {
    const tab = this.listTab[index];
    if (tab && this.tabContent) {
      this.tabContent.clear();
      const componentType = await tab.loadComponent();
      this.tabContent.createComponent(componentType as Type<any>);
    }
  }
}
