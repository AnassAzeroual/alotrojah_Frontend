import { Arabic } from 'flatpickr/dist/l10n/ar';
import { French } from 'flatpickr/dist/l10n/fr';
import type { CustomLocale } from 'flatpickr/dist/types/locale';
import type { AppLang } from '../../../core/i18n/language.service';

/**
 * Shared flatpickr locale map (DUP-01). Both pickers previously imported the
 * Arabic/French packs and repeated the same ternary — keep the mapping here
 * so locale coverage stays in one place.
 */
export function flatpickrLocale(lang: AppLang): CustomLocale | undefined {
  let locale: CustomLocale | undefined;

  if (lang === 'ar') {
    locale = Arabic;
  } else if (lang === 'fr') {
    locale = French;
  }

  return locale;
}
