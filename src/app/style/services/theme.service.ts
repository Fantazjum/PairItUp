import { Injectable, signal, WritableSignal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Theme } from '../enums/theme';
import { DateUtils } from '../../shared/utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public theme: WritableSignal<Theme>;
  private styleRef: HTMLLinkElement;

  private themeMap: {[themePrimaryColor: string]: Theme} = {
    '#DAD4CC': Theme.LIGHT1,
    '#F0FFF7': Theme.LIGHT2,
    '#DFD6D6': Theme.LIGHT3,
    '#646464': Theme.DARK1,
    '#301E33': Theme.DARK2,
    '#105060': Theme.DARK3,
  };

  private fileMap: Record<Theme, string> = {
    [Theme.LIGHT1]: '/assets/theme/light1.css',
    [Theme.LIGHT2]: '/assets/theme/light2.css',
    [Theme.LIGHT3]: '/assets/theme/light3.css',
    [Theme.DARK1]: '/assets/theme/dark1.css',
    [Theme.DARK2]: '/assets/theme/dark2.css',
    [Theme.DARK3]: '/assets/theme/dark3.css',
  };

  public isDark(): boolean {
    switch (this.theme()) {
      case Theme.DARK1:
      case Theme.DARK2:
      case Theme.DARK3:
        return true;
      case Theme.LIGHT1:
      case Theme.LIGHT2:
      case Theme.LIGHT3:
        return false;
    }
  }

  constructor(private cookies: CookieService) {
    const themeString = this.cookies.get('theme');
    let initTheme = (Object.values(Theme) as string[]).includes(themeString)
      ? themeString as Theme
      : undefined;

    if (initTheme === undefined) {
      const primaryColor = window.getComputedStyle(document.body)
        .getPropertyValue('--primaryBackground');
      initTheme = this.themeMap[primaryColor];
      this.cookies.set('theme', initTheme, { expires: DateUtils.getExpirationDate(), path: '/' });
    }

    this.theme = signal<Theme>(initTheme);
    this.styleRef = (document.getElementById('theme') as HTMLLinkElement);
    
    const themeFileSrc = this.fileMap[initTheme];
    this.styleRef.setAttribute('href', themeFileSrc);    
  }

  public update(theme: Theme) {
    this.theme.set(theme);
    const themeFileSrc = this.fileMap[theme];
    this.styleRef.setAttribute('href', themeFileSrc);
    this.cookies.set('theme', theme, { expires: DateUtils.getExpirationDate(), path: '/' });
  }
}
