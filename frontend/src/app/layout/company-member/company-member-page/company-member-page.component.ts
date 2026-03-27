import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'app/services/auth.service';
import { InviteUserComponent, InviteUserModalDialogData } from 'app/share/ui/invite-user/invite-user.component';
import { ItemOf } from 'app/types/utils';
import { filter, first } from 'rxjs';
const TeamTabs = [
  {
    icon: 'mail',
    title: localized$('Incoming requests'),
    path: 'incoming',
  },
  {
    icon: 'group',
    title: localized$('Members'),
    path: 'members',
  },
] as const;

type TabKey = ItemOf<typeof TeamTabs>['title'];
@Component({
  selector: 'app-company-member-page',
  imports: [MatIconModule, MatTabsModule, RouterModule, TranslateModule, MatButtonModule],
  templateUrl: './company-member-page.component.html',
  styleUrl: './company-member-page.component.scss',
})
export class CompanyMemberPageComponent {
  activeTab = signal<number | undefined>(undefined);
  listTab = TeamTabs;

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  translate = inject(TranslatePipe);
  platformId = inject(PLATFORM_ID);
  dialog = inject(MatDialog);

  private readonly authService = inject(AuthService);

  ngOnInit() {
    this.activeTab.set(this.indexOfTab);

    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          first(),
        )
        .subscribe(() => {
          this.activeTab.set(this.indexOfTab);
        });
    }
  }

  get indexOfTab(): number {
    const child = this.activatedRoute.firstChild;
    const tabName = child?.snapshot.url[0]?.path;
    const routes: string[] = Object.values(this.listTab).map((tab) => tab.path);
    if (tabName) {
      return routes.indexOf(tabName);
    }
    return 0;
  }

  onTabChange(event: any) {
    const segment = this.listTab[event.index];
    this.router.navigate([segment.path], { relativeTo: this.activatedRoute });
  }
  selectTab(key: TabKey) {
    const index = TeamTabs.findIndex((i) => i.title === key);
    this.activeTab.set(index);
  }
  closeTab() {
    this.activeTab.set(undefined);
  }

  openInviteModal() {
    const data: InviteUserModalDialogData = {
      isHaulier: this.authService.isHaulierUser,
    };

    this.dialog.open(InviteUserComponent, {
      width: '100%',
      maxWidth: '960px',
      height: '694px',
      maxHeight: '694px',
      panelClass: 'invite-user-dialog',
      data,
    });
  }
}
