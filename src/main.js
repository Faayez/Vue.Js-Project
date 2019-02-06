// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import VueResource from 'vue-resource';
import store from '@/stores/store.js';
import { i18n } from '@/translation/i18n.js';
import VueSidebarMenu from '@/components/SideBarMenu/index.js'
import VueHeaderbarMenu from '@/components/HeaderBarMenu/index.js'
//import VTooltip from 'v-tooltip'
import 'bootstrap';

import 'vue-awesome/icons/caret-down';
import 'vue-awesome/icons/caret-up';
import 'vue-awesome/icons/sort';
import 'vue-awesome/icons/check';
import 'vue-awesome/icons/check-double';
import 'vue-awesome/icons/regular/check-circle';
import 'vue-awesome/icons/regular/circle';
import 'vue-awesome/icons/cog';
import 'vue-awesome/icons/sync-alt';
import 'vue-awesome/icons/table';
import 'vue-awesome/icons/angle-double-down';
import 'vue-awesome/icons/file-excel';
import 'vue-awesome/icons/plus';
import 'vue-awesome/icons/save';
import 'vue-awesome/icons/user';
import 'vue-awesome/icons/lock';
import 'vue-awesome/icons/sign-out-alt';
import 'vue-awesome/icons/eye';
import 'vue-awesome/icons/eye-slash';
import 'vue-awesome/icons/download';
import 'vue-awesome/icons/upload';
import 'vue-awesome/icons/trash-alt';
import 'vue-awesome/icons/calendar-alt';
import 'vue-awesome/icons/filter';
import 'vue-awesome/icons/unlock';
import 'vue-awesome/icons/lock';
import 'vue-awesome/icons/angle-left';
import 'vue-awesome/icons/stopwatch';
import 'vue-awesome/icons/warehouse';
import 'vue-awesome/icons/ship';
import 'vue-awesome/icons/search';
import 'vue-awesome/icons/folder';
import 'vue-awesome/icons/tachometer-alt';
import 'vue-awesome/icons/clone';
import 'vue-awesome/icons/spinner';
import 'vue-awesome/icons/regular/square';
import 'vue-awesome/icons/regular/check-square';
import 'vue-awesome/icons/certificate';
import 'vue-awesome/icons/equals';
import 'vue-awesome/icons/not-equal';
import 'vue-awesome/icons/box';
import 'vue-awesome/icons/cubes';
import 'vue-awesome/icons/clipboard-list';
import 'vue-awesome/icons/bars';
import 'vue-awesome/icons/angle-right';
import 'vue-awesome/icons/angle-down';
import 'vue-awesome/icons/arrows-alt-h';
import 'vue-awesome/icons/home';
import 'vue-awesome/icons/industry';
import 'vue-awesome/icons/divide';
import 'vue-awesome/icons/undo';

import Icon from 'vue-awesome/components/Icon';


Vue.config.productionTip = false;
Vue.use(VueResource);
Vue.use(VueHeaderbarMenu)
Vue.use(VueSidebarMenu)
//Vue.use(VTooltip);
Vue.component('v-icon', Icon);

Array.prototype.distinct = function()  {
  let array = this.map((c) => { return JSON.stringify(c) });
  let result = array.filter(function(c, index) {
    return array.indexOf(c) === index;
  });
  return result.map((c) => { return JSON.parse(c) });
}

let update = [];
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  i18n,
  components: { App },
  template: '<App/>',
  created() {
    document.title = 'IT IF Education';
    Vue.http.options.root = process.env.API_HOST;
    Vue.http.headers.common["Content-Language"] = this.$i18n.locale;

    const token = localStorage.getItem('token');
    if (token) {
      Vue.http.headers.common['Authorization'] = 'Bearer ' + token
    };

    router.beforeEach((to, from, next) => {
      document.title = 'IT IF Education | ' + to.meta.title;
      next();
    });
  },
  watch: {
    '$i18n.locale'(to, from) {
        Vue.http.headers.common["Content-Language"] = to;
    }
  }
})
