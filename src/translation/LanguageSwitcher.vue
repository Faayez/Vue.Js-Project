<template>
    <div class="dropdown" title="Languages" v-if="language.length > 0">
        <button class="btn btn-outline-leeuwen-blue dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {{this.$i18n.locale.toUpperCase()}}
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <div class="dropdown-item" v-for="lang in language" :key="lang" @click="changeLang(lang)">{{lang.toUpperCase()}}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LanguageSwitcher',
    data: () => ({ language: [ 'en', 'nl' ]}),
    created() {
        this.getLanguages();
    },
    methods: {
        changeLang(lang) {
            this.$i18n.locale = lang;
        },
        getLanguages() {
            return this.$http.get('api/Translations/GetLanguages').then((res) => {
                if(res.data.length > 0) {
                    this.language = res.data;
                };
                if(this.language.length > 0) {
                    this.changeLang(this.language[0]);
                };
                this.getTranslations();
                return;
            });
        },
        getTranslations() {
            return this.$http.get('api/Translations/GetTranslations/' + this.$i18n.locale + '/' + this.$route.params.projectId ).then((res) => {
                let messages = {};
                res.data.forEach((r) => { 
                    messages[r.label] = r.text;
                });
                if(this.$i18n.messages[this.$i18n.locale] ==  null) {
                    this.$i18n.setLocaleMessage(this.$i18n.locale, messages);
                } else {
                    this.$i18n.mergeLocaleMessage(this.$i18n.locale, messages);
                }
                localStorage.setItem(this.$i18n.locale, JSON.stringify(this.$i18n.messages[this.$i18n.locale]));
            });
        },
    },
    watch: {
        '$i18n.locale'(to, from) {
            if(this.$i18n.messages[to] == null)
                this.getTranslations();
        },
        '$route.params.projectId'(to, from) {
            if(to != null)
                this.getTranslations();
        }
    }
}
</script>

<style scoped>
button {
    margin-left: 10px;
}
</style>