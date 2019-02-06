<template>
  <div id="_projectLayout">
        <slot name="content">No Content</slot>
  </div>
</template>

<script>
import TheLeftMenu from '@/components/TheLeftMenu';

export default {
  name: 'Project',
  components: {
    'the-left-menu': TheLeftMenu
  },
  data () {
    return {
      project: null,
      tab: '#dashboard-pill',
      selectedProjectOrderLine: null,
      activeTab: null,
      tabs: [{
              id: 0,
              label: 'Dashboard',
              go: 'Project',
              icon: 'tachometer-alt'
            },
            /*
            {
              id: 1,
              label: 'Project Orders',
              go: 'ProjectOrders',
              icon: 'folder',
              roles: ['Admin']
            },
            */
            {
              id: 2,
              label: 'Upload DUF',
              go: 'DUF',
              icon: 'upload',
              roles: ['Admin']
            },
            {
              id: 3,
              label: 'Expediting',
              go: 'Expediting',
              icon: 'stopwatch',
              roles: ['Admin', 'Expediter']
            },
            {
              id: 4,
              label: 'Inspection',
              go: 'Inspection',
              icon: 'search',
              roles: ['Admin', 'Inspector']
            },
            {
              id: 5,
              label: 'Shipping',
              go: 'Shipping',
              icon: 'ship',
              roles: ['Admin', 'Shipper']
            },
            {
              id: 6,
              label: 'Warehouse',
              go: 'Warehouse',
              icon: 'warehouse',
              roles: ['Admin', 'Warehouse']
            },
            {
              id: 7,
              label: 'Configuration',
              go: 'ProjectConfiguration',
              icon: 'cog',
              roles: ['Admin']
            }]
    }
  },
  mounted() {
    if(this.$store.getters.projectId != this.$route.params.projectId) {
      this.$store.dispatch('SET_PROJECT_ID', this.$route.params.projectId);
    }
  },
  methods: {
  },
  computed: {
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
