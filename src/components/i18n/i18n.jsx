// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../Localization/en.json';
import translationFR from '../Localization/fr.json';
import translationES from '../Localization/es.json';
import translationIT from '../Localization/it.json';
import translationPT from '../Localization/pt.json';
import translationJP from '../Localization/jp.json';
import translationCH from '../Localization/ch.json';

const resources = {
  en: { translation: translationEN },
  fr: { translation: translationFR },
  es: { translation: translationES },
  pt: { translation: translationPT },
  jp: { translation: translationJP },
  ch: { translation: translationCH },
  it: { translation: translationIT }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    },
    compatibilityJSON: 'v3' // Utilise le format de compatibilité JSON v3 pour la gestion des pluriels
  });

export default i18n;
