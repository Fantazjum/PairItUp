import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { LanguageIconsPipe } from '../pipes/language-icons.pipe';
import { CookieService } from 'ngx-cookie-service';
import { DateUtils } from '../utils/date-utils';

@Component({
    selector: 'app-language-selector',
    imports: [SelectModule, FormsModule, LanguageIconsPipe],
    templateUrl: './language-selector.component.html',
    styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent implements OnInit {
  protected currentLanguage!: string;

  protected languages = ['de', 'en', 'pl',];

  protected languageNames: {[languageCode: string]: string} = {
    'de': 'Deutsch',
    'en': 'English',
    'pl': 'Polski',
  };

  public constructor(private translate: TranslateService, private cookies: CookieService) {}

  public ngOnInit(): void {
    const language = this.cookies.get('lang');
    if (language) {
      this.translate.use(language);
      this.currentLanguage = language;
    } else {
      const browserLang = navigator.language.substring(0, 2);
      const isSupported = this.languages.find((language) => language === browserLang) !== undefined;
      if (isSupported) {
        this.cookies.set('lang', browserLang, { expires: DateUtils.getExpirationDate(), path: '/' });
        this.translate.use(browserLang);
        this.currentLanguage = browserLang;
      } else {
        this.currentLanguage = this.translate.currentLang;
      }
    }
  }

  protected changeLanguage(): void {
    this.translate.use(this.currentLanguage);
    this.cookies.set(
      'lang',
      this.currentLanguage,
      { expires: DateUtils.getExpirationDate(), path: '/' },
    );
  }
}
