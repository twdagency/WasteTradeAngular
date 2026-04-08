import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { LanguageSelectorComponent } from 'app/layout/common/language-selector/language-selector.component';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { addLanguagePrefix } from 'app/utils/language.utils';

interface MaterialLink {
  abbreviation: string;
  name: string;
  url: string;
}

@Component({
  selector: 'app-cms-header',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    LanguageSelectorComponent,
  ],
  templateUrl: './cms-header.component.html',
  styleUrl: './cms-header.component.scss',
})
export class CmsHeaderComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userSub: Subscription;

  isLoggedIn = signal(false);
  isHaulier = signal(false);
  menuOpen = signal(false);

  materials: MaterialLink[] = [
    { abbreviation: 'PET', name: 'Polyethylene Terephthalate', url: 'https://www.wastetrade.com/pet-recycling/' },
    { abbreviation: 'HDPE', name: 'High-density Polyethylene', url: 'https://www.wastetrade.com/hdpe-recycling/' },
    { abbreviation: 'PVC', name: 'Polyvinyl Chloride', url: 'https://www.wastetrade.com/pvc-recycling/' },
    { abbreviation: 'LDPE', name: 'Low-Density Polyethylene', url: 'https://www.wastetrade.com/ldpe-recycling/' },
    { abbreviation: 'PP', name: 'Polypropylene', url: 'https://www.wastetrade.com/pp-recycling/' },
    { abbreviation: 'EPS', name: 'Expanded Polystyrene', url: 'https://www.wastetrade.com/eps-recycling/' },
    { abbreviation: 'PC', name: 'Polycarbonate', url: 'https://www.wastetrade.com/pc-recycling/' },
    { abbreviation: 'ABS', name: 'Acrylonitrile Butadiene Styrene', url: 'https://www.wastetrade.com/abs-recycling/' },
    { abbreviation: 'PMMA', name: 'Acrylic', url: 'https://www.wastetrade.com/acrylic-recycling/' },
  ];

  constructor() {
    this.userSub = this.authService.user$.subscribe((user) => {
      this.isLoggedIn.set(!!user);
      this.isHaulier.set(this.authService.isHaulierUser);
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  navigateToLogin(): void {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.login);
  }

  navigateToRegister(): void {
    this.router.navigateByUrl(addLanguagePrefix('/create-account'));
  }

  navigateToDashboard(): void {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
  }
}
