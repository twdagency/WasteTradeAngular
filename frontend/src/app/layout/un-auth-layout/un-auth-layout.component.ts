import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { LanguageSelectorComponent } from '../common/language-selector/language-selector.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-un-auth-layout',
  templateUrl: './un-auth-layout.component.html',
  styleUrls: ['./un-auth-layout.component.scss'],
  imports: [RouterModule, RouterModule, FooterComponent, MatButtonModule, LanguageSelectorComponent],
})
export class UnAuthLayoutComponent {
  private router = inject(Router);

  goLoginPage() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.login);
  }
}
