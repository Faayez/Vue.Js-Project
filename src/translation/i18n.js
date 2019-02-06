import Vue from 'vue';
import VueI18n from 'vue-i18n';
import dateTimeFormats from '@/translation/dateTimeFormats.js'

Vue.use(VueI18n);

//let missingTranslations = [];

export const i18n = new VueI18n({
    locale: 'en',
    fallbackLocalse: 'en',
    silentTranslationWarn: true,
    messages: { },
    numberFormats: {
        'en': {
            currency: {
                style: 'currency',
                currency: 'USD',
                currencyDisplay: '$'
            }
        },
        'nl': {
            currency: {
                style: 'currency',
                currency: 'EUR',
                currencyDisplay: '€'
            }
        }
    },
    dateTimeFormats: {
        'en': {
            short: {
                year: 'numeric', month: 'short', day: 'numeric'
            },
            long: {
                year: 'numeric', month: 'short', day: 'numeric',
                weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true
            }
        },
        'nl': {
            short: {
                year: 'numeric', month: 'short', day: 'numeric'
            },
            long: {
                year: 'numeric', month: 'short', day: 'numeric',
                weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
            }
        }
    }
    //missing: (lang, key) => { return missingTranslations.push({ lang: lang, key: key }) }
});
