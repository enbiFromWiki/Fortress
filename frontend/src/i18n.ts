import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLangauge = localStorage.getItem('fortress-settings');
const [browserLangauge] = navigator.language.split('-');

const language = savedLangauge ?? browserLangauge ?? 'en';

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
