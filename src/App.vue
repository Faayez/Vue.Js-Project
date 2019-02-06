<template>
  <div id="app">
      <headerbar-menu page='admin/dashboard' :class="{ 'collapsed': isCollapsed }" id="headerbar" :collapsed="isCollapsed" @collapse="onCollapse" v-if="isAuthenticated"></headerbar-menu>
      <sidebar-menu page='admin/dashboard' @collapse="onCollapse" :collapsed="isCollapsed"  v-if="isAuthenticated"></sidebar-menu>
      <router-view id="content" :class="{ 'collapsed': isCollapsed, 'nomenu': noMenu }"/>
      <footer class="footer fixed-bottom" :class="[ environment == 'development' ? 'bg-red' : 'bg-light']">
        <div class="text-right">
          <strong>{{projectName}}</strong>
          <span class="text-muted">© {{year}} - Van Leeuwen Pipe and Tube. All rights reserved (v{{version}}) - {{environment}}</span>
          <a href="http://itifmedical.com" target="_blank">
            <img src="@/assets/logo-theintelligencecompany_2-flav-orange-32.png" height="32" />
          </a>
        </div>
      </footer>
  </div>
</template>

<script>
//import TheNavHeader from '@/components/TheNavHeader';
import LogoText from "raw-loader!./assets/itifmedicalcompany.txt";
import TheHeaderBarMenu from '@/components/TheHeaderBarMenu';
import TheSideBarMenu from '@/components/TheSideBarMenu';

export default {
  name: 'App',
  data() {
    return {
      isCollapsed: true
    }
  },
  components: {
    //'the-nav-header': TheNavHeader,
    'headerbar-menu': TheHeaderBarMenu,
    'sidebar-menu': TheSideBarMenu
  },
  created() {
    console.log(LogoText);
  },
  mounted() {
  },
  methods: {
    onCollapse(isCollapsed) {
        this.isCollapsed = isCollapsed;
      }
  },
  computed: {
    year() {
      return new Date().getFullYear();
    },
    version() {
      return process.env.VERSION;
    },
    environment() {
      return process.env.NODE_ENV;
    },
    noMenu() {
      return !this.isAuthenticated;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    },
    projectName() {
        if(this.$store.getters.project == null)
            return '';
        return this.$store.getters.project.name + " | ";
    },
  }
}
</script>

<style lang="scss">
//@import '../styles/custom-bootstramp.scss';
@import '../node_modules/bootstrap/scss/bootstrap.scss';

html {
  font-size: 0.8rem;
}

.content {
  padding-top: 15px;
  padding-bottom: 15px;
}
.btn-full {
  width: 100%;
}
.btn-round {
  border-radius: 50%;
}
.btn-outline-leeuwen {
    color:#c00a2b;
    background-color: transparent;
    background-image: none;
    border-color:#c00a2b;
}
.btn-outline-leeuwen:hover {
  color: #fff;
  background-color: #c00a2b;
}

.btn-leeuwen {
  color: #fff;
  background-color: #c00a2b;
  border-color:#c00a2b
}

.btn-leeuwen:hover {
  background-color: #980721;
  border-color:#980721;
}

.btn-outline-leeuwen-blue {
    color:#1658a6;
    background-color: transparent;
    background-image: none;
    border-color:#1658a6;
}
.btn-outline-leeuwen-blue:hover {
  color: #fff;
  background-color: #1658a6;
}

.btn-leeuwen-blue {
  color: #fff;
  background-color: #1658a6;
  border-color:#1658a6
}

.btn-leeuwen-blue:hover {
  background-color: #0f3a71;
  border-color:#0f3a71;
}

.fa-icon {    
    display:inline-block;
    text-align: center;
    //vertical-align: top;
}
.nav.tab-content {
    border: 1px solid transparent;
    border-color: transparent #dee2e6 #dee2e6;
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    padding: 0.5rem 1rem;
}
.red {
  color: #c00a2b;
}
.bg-red {
  background-color: rgba(192, 10, 43, 0.5) !important;
}
.blue, a, a:hover {
  color: #1658a6;
}
.ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
}
label {
  font-weight: bold;
}

#content{
  transition: 0.3s margin-left;
  padding:15px;
  margin-left: 350px;
  margin-right: 0;
  margin-bottom: 55px;

}

#content.nomenu {
  margin-left: 0 !important;
}

#content.collapsed {
  margin-left: 50px;
}

#headerbar {
  transition: 0.3s margin-left;
  margin-left: 350px;
}
#headerbar.collapsed {
  margin-left: 50px;
}


footer {
    //position: sticky;
    //bottom: 0;
    //width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #f5f5f5;
    z-index: 998 !important;
}
</style>
