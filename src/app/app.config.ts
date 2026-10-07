import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideMissingTranslationHandler, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { authInterceptor } from './core/auth/auth.interceptor';
import { LanguageService } from './core/i18n/language.service';
import { LogMissingTranslationHandler } from './core/i18n/missing-translation.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTranslateService({
      lang: 'ar',
      fallbackLang: 'en',
    }),
    provideTranslateHttpLoader(),
    provideMissingTranslationHandler(() => new LogMissingTranslationHandler()),
    provideAppInitializer(() => {
      inject(LanguageService).init();
      // Fire-and-forget: first paint must not block on /auth/me. Guards wait on
      // AuthService.ready before making login/role decisions.
      inject(AuthService).init();
    }),
  ],
};
