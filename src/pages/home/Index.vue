<template>
  <div id="homeIndex" class="row">
    <div class="col-md-12">
      <div class="input-group input-group-lg mb-3">
        <input class="form-control text-center" v-model="filter" :placeholder="'Filter ' + view + 's...'">
        <div class="input-group-append">
          <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="switchView">
            <v-icon name="eye" ></v-icon> {{ $t('Switch View')}}
          </button>
        </div>
      </div>
    </div>
    <div v-show="filteredCustomers.length > 0 && view == 'Customer'" class="col-md-3" :key="'customer_' + customer.id" v-for="customer in filteredCustomers">
      <project-card :property="customer" type="Customer"></project-card>
    </div>
    <div v-show="filteredOpcos.length > 0 && view == 'Opco'" class="col-md-3" :key="'opco_' + opco.id" v-for="opco in filteredOpcos" >
      <project-card :property="opco" type="Opco"></project-card>
    </div>
    <div v-if="!loading && filteredCustomers.length == 0" class="col-md-12 text-center">
      <router-link tag="button" type="button" class="btn btn-leeuwen btn-lg" :to="{ name : 'NewProject' }">
        <v-icon name="plus"></v-icon> Create New Project
      </router-link>
    </div>
    <div v-else-if="filteredCustomers.length == 0" class="text-center">
      <v-icon name="spinner" spin></v-icon>
    </div>
  </div>
</template>

<script>
import ProjectCard from '@/components/ProjectCard';

export default {
  name: 'Index',
  components: {
    'project-card': ProjectCard
  },
  data () {
    return {
      filter: '',
      erps: [],
      opcos: [],
      customers: [],
      view: 'Customer',
      loading: true
    }
  },
  created() {
  },
  mounted() {
    this.loading = true;
    this.$store.commit("SET_ROLES", this.$store.getters.user.roles);
    this.$store.dispatch("GET_OPTIONS", "Customers").then((data) => { 
      this.loading = false;
      this.$store.dispatch("GET_OPTIONS", "Opcos").then((data) => { return this.opcos = data });
      return this.customers = data 
    });
  },
  methods: {
    switchView() {
      if(this.view == "Customer")
      {
        return this.view = "Opco"
      }
      return this.view = "Customer";
    },
    getErp() {
      this.$http.get('api/Erps').then((res) => {
        this.erps = res.data;
      });
    },
  },
  computed: {
    filteredCustomers() {
      return this.customers.filter((c) => { return c.text.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0 });
    },
    filteredOpcos() {
      return this.opcos.filter((c) => { return c.text.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0 });
    },
    roles() {
      return this.$store.getters.roles;
    }
  }
}
</script>

<style scoped>
.no-padding {
  padding: 0;
}
.no-padding .list-group-item {
  border: 0 !important;
  border-radius: 0 !important;
}
.padding {
  padding-top: 15px;
}
.col-md-3 {
  margin-bottom: 15px;
}
.modal-link {
  display: inline-block;
  margin-left: 5px;
  opacity: 0.5;
}
.modal-link:hover {
  cursor:pointer;
  opacity: 1;
}
.list-group-item {
  cursor: pointer;
}
</style>
