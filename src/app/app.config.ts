import { ApplicationConfig, importProvidersFrom, Injector, LOCALE_ID, provideZoneChangeDetection, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
	TranslateLoader,
	TranslateModule,
	TranslateService,
} from '@ngx-translate/core';
import { LOCATION_INITIALIZED, registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';

registerLocaleData(localePl, 'pl');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeDe, 'de');

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
	return new TranslateHttpLoader(http);
}

export function i18nInitializerFactory(
	translate: TranslateService,
	injector: Injector
) {
	return (): Promise<void | null> =>
		new Promise<void | null>(resolve => {
			const locationInitialized = injector.get(
				LOCATION_INITIALIZED,
				Promise.resolve(null)
			);
			locationInitialized.then(() => {
				const langToSet = 'pl';
				translate.setDefaultLang(langToSet);
				translate.use(langToSet).subscribe({
					error: () => {
						// eslint-disable-next-line no-console
						console.error(
							`Problem with '${langToSet}' language initialization.'`
						);
					},
					complete: () => {
						resolve(null);
					},
				});
			});
		});
}

export const appConfig: ApplicationConfig = {
  providers: [
	provideAnimationsAsync(),
	providePrimeNG({
		theme: {
			preset: Lara
		}
	}),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
	importProvidersFrom(
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		})
	),
	provideAppInitializer(() => {
        const initializerFn = (i18nInitializerFactory)(inject(TranslateService), inject(Injector));
        return initializerFn();
	}),
	{ provide: LOCALE_ID, useValue: 'pl' },
  ]
};
