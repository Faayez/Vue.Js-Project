<template>
    <div class="tab-pane fade show" :id="this.tab.id" role="tabpanel">
        <div class="row">
            <div class="col-md-6">
                <h3>Translations</h3>
            </div>
            <div class="col-md-6">
                <div class="text-right">
                    <button class="btn btn-success" type="button" v-if="isDirty" @click="saveChanges">
                        <v-icon name="save"></v-icon> Save Changes
                    </button>
                    <button class="btn btn-outline-leeuwen" hidden>
                        <v-icon name="plus"></v-icon> Add Field
                    </button>
                    <button class="btn btn-outline-leeuwen" type="button" @click="addLanguage" >
                        <v-icon name="plus"></v-icon> Add Language
                    </button>
                </div>
            </div>
        </div>
        <hr>
        <div class="form-group">
            <input class="form-control" placeholder="Filter..." v-model="filter" />
        </div>
        <div class="table-responsive">
            <table class="table table-hover table-sm table-bordered">
                <thead>
                    <tr>
                        <th>Label</th>
                        <th v-for="(lang, index) in languages" :key="index">
                            <div class="row">
                                <div class="col-6">
                                    <input type="text" class="form-control-plaintext" @change="onChangeLanguage(lang)" v-model="lang.label" />
                                </div>
                                <div class="col-6 text-right">
                                    <button class="btn btn-sm btn-leeuwen" @click="removeLanguage(lang)">
                                        <v-icon name="trash-alt"></v-icon>
                                    </button>
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(t, index) in filteredTranslations" :key="index">
                        <td>
                            {{t.label}}
                        </td>
                        <td v-for="(lang, index) in t.languages" :key="index" >
                            <div class="input-group input-group-sm">
                                <input type="text" class="form-control-plaintext" @change="onChange(lang)" v-model="lang.text" :class="{ 'red' : lang.isDirty }" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="loading" class="text-center">
                <img src="@/assets/loader.gif" title="loading" width="40" />
            </div>
            <div class="text-right">
                <button class="btn btn-success" type="button" v-if="isDirty" @click="saveChanges">
                    <v-icon name="save"></v-icon> Save Changes
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: '',
        props: ['tab'],
        data: () => {
            return {
                languages: [],
                filter: null,
                translations: [],
                loading: true
            }
        },
        created() {
            return this.$http.get('api/Translations/' + this.$route.params.projectId).then((res) => {
                res.data.forEach((c) => {
                    if(!this.languages.some(l => { return l.label == c.abbreviation}))
                    {
                        this.languages.push({ label: c.abbreviation, orgValue: c.abbreviation });
                    };
                });

                let labels = [];
                res.data.forEach((c) => {
                    const label = labels.find((l) => { return c.label == l.label});
                    if(label == null)
                    {
                        let languages = [];
                        this.languages.forEach((l) => {
                            return languages.push({ id: c.id, lang: l.label, text: c.text, orgValue: c.text, isDirty: false, isNew: (c.id < 0) ? true : false })
                        });
                        labels.push({ label: c.label, languages: languages });
                    } 
                    else 
                    {
                        let lang = label.languages.find((l) => { return l.lang == c.abbreviation });
                        lang.id = c.id;
                        lang.text = c.text;
                        lang.orgValue = c.text;
                    };
                });

                this.translations = labels.filter((c, v, labels) => { return labels.indexOf(c) === v });
                this.loading = false;
            });
        },
        methods: {
            addLanguage() {
                this.translations.forEach((t) => {
                    t.languages.push({ id: -1, lang: 'new', text: t.label, orgValue: t.label, isDirty: false, isNew: true })
                });
                this.languages.push({ label: 'new', orgValue: 'new' });
            },
            removeLanguage(lang) {
                return this.$http.delete('api/Translations/RemoveLanguage/' + lang.label + '/' + this.$route.params.projectId ).then((res) => {
                    this.languages.splice(this.languages.findIndex((l) => { return l.label == lang.label }), 1);
                    return this.translations.forEach((t) => {
                        t.languages.splice(t.languages.findIndex((l) => { return lang.label == l.abbreviation }), 1);
                    })
                });
            },
            addField() {
                
            },
    	    onChange(t) {
                if(t.orgValue != t.text) {
                    t.isDirty = true;
                } else {
                    t.isDirty = false;
                }
            },
            onChangeLanguage(lang) {
                this.translations.forEach((c) => {
                    let org = c.languages.find(l => { return l.lang == lang.orgValue });
                    org.lang = lang.label;
                    //org.isDirty = true;
                    org.isNew = true;
                });
                lang.orgValue = lang.label;
            },
            saveChanges() {
                const isDirty = this.translations.filter((c) => { return c.languages.some((l) => { return l.isDirty; }) });

                let translations = [];
                isDirty.forEach((c) => {
                    const dirtyLanguages = c.languages.filter((l) => { return l.isDirty });

                    dirtyLanguages.forEach((l) => {
                        const t = {
                            id: l.id,
                            projectId: this.$route.params.projectId,
                            abbreviation: l.lang,
                            label: c.label,
                            text: l.text
                        };
                        translations.push(t);
                    });
                    
                });
                
                return this.$http.post('api/Translations', translations).then((res) => {
                    isDirty.forEach((c) => {
                        let lang = res.data.find((l) => { return l.label == c.label });
                        
                        c.languages.forEach((l) => 
                        {
                            if(lang != null) {
                                if(lang.abbreviation == l.lang) {
                                    l.id = lang.id;
                                };
                            };
                            l.orgValue = c.text;
                            l.isNew = false;
                            l.isDirty = false;

                            localStorage.removeItem(l.lang);
                        });
                    });
                    this.getTranslations();
                });
            },
            getTranslations() 
            {
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
            }
        },
        computed: {
            filteredTranslations() {
                if(this.filter != null && this.filter != '') {
                    return this.translations.filter((c) => { return c.label.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0 });
                } else {
                    return this.translations;
                }
            },
            isDirty() {
                return this.translations.some((c) => { return c.languages.some((l) => { return l.isDirty}) });
            }
        }
    }
</script>

<style scoped>
.form-control-plaintext {
    padding: 0;
}
.red {
    color: red;
}
</style>