<template>
  <div id="sidebar-menu" :class="{'collapsed' : collapsed}" @mouseleave="mouseLeave">
    <router-link tag="div" class="sidebar-logo" :to="{ name: 'Index' }">
      <img src="@/assets/itifwebtechlogo.png"  v-if="collapsed" />
      <img src="@/assets/logo.png"  v-if="!collapsed" />
    </router-link>
    <ul class="default-list menu-list">
      <item v-for="(item, index) in menu" :key="index" :item="item" :firstItem="true" :isCollapsed="collapsed" v-if="isInRole(item)" />
    </ul>
    <ul v-if="collapsed" class="mobile-list menu-list" :style="{'top' : `${mobileItemPos}px`}">
      <mobile-item :item="mobileItem" :mobileItemPos="mobileItemPos" />
    </ul>
    <button class="collapse-btn" @click="toggleCollapse">
      <v-icon name="arrows-alt-h"></v-icon>
    </button>
  </div>
</template>

<script>
import Item from './Item.vue'
import SubItem from './SubItem.vue'
import MobileItem from './MobileItem.vue'

export default {
  name: 'SidebarMenu',
  components: {
    Item,
    SubItem,
    MobileItem
  },
  props: {
    menu: {
      type: Array,
      required: true
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCollapsed: this.collapsed,
      mobileItem: null,
      mobileItemPos: -50
    }
  },
  created() {
    this.$on('mouseEnterItem', (val) => {
      this.mobileItem = val.item;
      this.mobileItemPos = val.pos;
      //this.isCollapsed = true;
    });
    this.$on('mouseLeaveItem', (val) => {
      //this.mobileItem = null
    })
  },
  methods: {
    mouseLeave() {
        this.mobileItem = null
    },
    toggleCollapse() {
      this.$emit('collapse', (this.collapsed) ? false : true);
    },
    isInRole(tab) {

      if(!!this.$store.getters.project)
      {
        if(tab.title.toLowerCase() == "inspection" && !this.$store.getters.project.isInspectionModuleEnabled)
          return false;

        if(tab.title.toLowerCase() == "shipping" && !this.$store.getters.project.isShippingModuleEnabled)
          return false;

        if(tab.title.toLowerCase() == "warehouse" && !this.$store.getters.project.isWarehouseModuleEnabled)
          return false;
      }
      if(tab.roles != null) {
        if(tab.roles.some((r) => { return this.roles.indexOf(r) >= 0 }))
        {
          return true;
        } else {
          return false;
        }
      }
      return true;
    },
  },
  computed: {
    role() {
      return this.$store.getters.role
    },
    roles() {
      return this.$store.getters.roles
    }
  },
  watch: {
    mobileItem(to, from) {
      if(!to)
      {
        setTimeout(() =>{
          this.mobileItemPos = -50
        }, 300)
      }
    }
  }
}
</script>


<style lang="scss">
@import '../styles/main.scss';
</style>
