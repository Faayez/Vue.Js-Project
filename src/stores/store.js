import Vue from 'vue'
import Vuex from 'vuex'
import AuthStore from '@/stores/authStore.js'
import ProjectStore from '@/stores/projectStore.js'
import OptionStore from '@/stores/optionStore.js'

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    authStore: AuthStore,
    projectStore: ProjectStore,
    optionStore: OptionStore
  },
  strict: true
});

export default store;