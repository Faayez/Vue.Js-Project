<template>
    <div class="menu">
      <div class="header">
        Menu
        <span class="right">
          <v-icon name="angle-left" scale="2"></v-icon>
        </span>
      </div>
      <div class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <router-link tag="a" :key="tab.label" v-for="tab in tabs" v-if="isRole(tab)" class="nav-link" :to="{ name: tab.go }"  v-bind:class="{'active': tab.active }">
            <v-icon :name="tab.icon"></v-icon>
            <span>{{tab.label}}</span>
          </router-link>
      </div>
    </div>
</template>

<script>
    export default {
      name: 'the-left-menu',
      props: ['tabs'],
      data() {
        return {
        };
      },
      mounted() {
        
      },
      methods: {
        isRole(tab) {
          if(tab.roles != null) {
            if(tab.roles.indexOf(this.role) < 0)
            {
              return false;
            }
          }
          return true;
        },
      },
      computed: {
        role() {
          return this.$store.getters.role
        }
      }
    };
</script>

<style scoped>
a {
  color: #c00a2b
}
.nav-link {
  margin-bottom: 5px;
}
.nav-link:hover, .nav-link.router-link-active {
  background-color: #c00a2b;
  color: #fff;
} 

.large {
  font-size: 2rem;
}
.right {
  float: right;
}
.fa-icon {
  vertical-align: inherit;
}
.fa-icon:hover {
  cursor: pointer;
}
.header {
  color: #1658a6;    
  font-weight: 500; 
  font-size: 2rem; 
  display: block;
  padding: 0.5rem 0.5rem 0.5rem calc(1rem + 15px);
  margin-left: -15px;
}

</style>

