import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLanguage = localStorage.getItem('fortress-settings');
const [browserLanguage] = navigator.language.split('-');

const language = savedLanguage ?? browserLanguage ?? 'en';

import en from '../i18n/en.json';
import test from '../i18n/test.json';

i18n.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',

    resources: {
        en: {
            translation: en,
        },
        test: {
            translation: test,
        },
    },
});
