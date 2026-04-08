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
  slug: string;
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
    { abbreviation: 'PET', name: 'Polyethylene Terephthalate', slug: 'pet-recycling' },
    { abbreviation: 'HDPE', name: 'High-density Polyethylene', slug: 'hdpe-recycling' },
    { abbreviation: 'PVC', name: 'Polyvinyl Chloride', slug: 'pvc-recycling' },
    { abbreviation: 'LDPE', name: 'Low-Density Polyethylene', slug: 'ldpe-recycling' },
    { abbreviation: 'PP', name: 'Polypropylene', slug: 'pp-recycling' },
    { abbreviation: 'EPS', name: 'Expanded Polystyrene', slug: 'eps-recycling' },
    { abbreviation: 'PC', name: 'Polycarbonate', slug: 'pc-recycling' },
    { abbreviation: 'ABS', name: 'Acrylonitrile Butadiene Styrene', slug: 'abs-recycling' },
    { abbreviation: 'PMMA', name: 'Acrylic', slug: 'acrylic-recycling' },
    { abbreviation: 'Tyres', name: 'Tyres', slug: 'tyres-recycling' },
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
