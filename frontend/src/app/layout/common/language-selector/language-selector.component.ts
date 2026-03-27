import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { getCurrentLanguage } from '../../../utils/language.utils';

@Component({
  selector: 'app-language-selector',
  imports: [MatIconModule, MatMenuModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
})
export class LanguageSelectorComponent {
  languages = [
    { code: 'en', label: 'English', flag: 'fi-gb' },
    { code: 'es', label: 'Spanish', flag: 'fi-es' },
  ];

  currentLanguage = signal('');
  platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  currentLanguageFlag = computed(() => {
    const currentLang = this.currentLanguage();
    const flag = this.languages.find((lang) => lang.code === currentLang)?.flag ?? this.languages[0].flag;
    return flag;
  });

  constructor(private translate: TranslateService) {
    const languageCode = getCurrentLanguage();
    // init value according the current language
    this.currentLanguage.set(languageCode);
  }

  setLanguage(code: string) {
    this.translate.use(code);
    localStorage.setItem('language', code);
    this.currentLanguage.set(code);

    // Get current URL and handle language switching
    const currentUrl = this.router.url;
    let newUrl: string;

    // change from es to other lang
    if (currentUrl.startsWith('/es/')) {
      // Currently on Spanish route
      if (code === 'en') {
        // Switching from Spanish to English: remove /es prefix
        newUrl = currentUrl.substring(3); // Remove '/es'
        if (!newUrl.startsWith('/')) {
          newUrl = '/' + newUrl;
        }
      } else {
        // Staying on Spanish, no change needed
        return;
      }
    } else {
      // Currently on English route (no prefix)
      if (code === 'es') {
        // Switching from English to Spanish: add /es prefix
        newUrl = '/es' + currentUrl;
      } else {
        // Staying on English, no change needed
        return;
      }
    }

    this.router.navigateByUrl(newUrl);
  }

  get currentLang() {
    return this.translate.currentLang || this.translate.defaultLang;
  }
}
