import { Component, OnInit, inject } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from './services/analytics.service';
import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatCheckboxModule, MatRadioModule, MatSnackBarModule, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // important: dont delete it, we need initiate the language service
  private languageService = inject(LanguageService);
  private seoService = inject(SeoService);
  private analyticsService = inject(AnalyticsService);

  constructor(
    private authService: AuthService,
    private translate: TranslateService,
  ) {
    this.translate.addLangs(['fr', 'en', 'es']);
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.authService.checkToken().subscribe();
  }
}
