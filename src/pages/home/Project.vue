<template>
  <div id="homeProject">
    <h2>Add Project: {{project.projectNo}}</h2>
    <hr>
    <form @submit.prevent="saveProject" v-if="customers.length > 0 && opcos.length > 0">
      <div class="form-group row">
        <label for="duplicate" class="col-sm-2 col-form-label">Clone</label>
        <div class="col-sm-10">
          <select type="text" class="form-control" id="duplicate" v-model="project.duplicate">
            <option value="null">New empty project</option>
            <option
              :value="project.id"
              v-for="project in projects"
              :key="project.id"
            >{{project.id}} - {{project.name}}</option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <label for="projectName" class="col-sm-2 col-form-label">Project Name</label>
        <div class="col-sm-10">
          <input
            type="text"
            class="form-control"
            id="projectName"
            v-model="project.name"
            @change="makeDirty"
            required
          >
        </div>
      </div>
      <div class="form-group row">
        <label for="projectCustomer" class="col-sm-2 col-form-label">Customer</label>
        <div class="col-sm-10 input-group">
          <select
            class="form-control"
            id="projectCustomer"
            v-model="project.customerId"
            @change="makeDirty"
          >
            <option :key="c.id" v-for="c in customers" :value="c.id">{{c.name}}</option>
          </select>
          <div class="input-group-append">
            <router-link
              :to="{ name: 'Customer'}"
              tag="button"
              type="button"
              class="btn btn-outline-secondary"
            >New Customer</router-link>
          </div>
        </div>
      </div>
      <div class="form-group row">
        <label for="projectOpco" class="col-sm-2 col-form-label">OPCO</label>
        <div class="col-sm-10 input-group">
          <select
            class="form-control"
            id="projectOpco"
            v-model="project.opcoId"
            @change="makeDirty"
          >
            <option :key="c.id" v-for="c in opcos" :value="c.id">{{c.name}}</option>
          </select>
          <div class="input-group-append" v-if="roles.indexOf('Admin') >= 0">
            <router-link
              :to="{ name: 'Opco'}"
              tag="button"
              type="button"
              class="btn btn-outline-secondary"
            >New OPCO</router-link>
          </div>
        </div>
      </div>
      <div class="form-group row">
        <label for="projectERP" class="col-sm-2 col-form-label">ERP System</label>
        <div class="col-sm-10">
          <input
            type="text"
            class="form-control"
            id="projectERP"
            v-model="project.erp"
            @change="makeDirty"
          >
        </div>
      </div>
      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Currency</label>
        <div class="col-sm-10">
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="currencyOptions"
              id="currencyOption1"
              value="€"
              v-model="project.currency"
            >
            <label class="form-check-label" for="currencyOption1">€</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="currencyOptions"
              id="currencyOption2"
              value="$"
              v-model="project.currency"
            >
            <label class="form-check-label" for="currencyOption2">$</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="currencyOptions"
              id="currencyOption3"
              value="S$"
              v-model="project.currency"
            >
            <label class="form-check-label" for="currencyOption3">S$</label>
          </div>
        </div>
      </div>
      <div class="form-check row mb-3">
        <div class="col-sm-10 offset-md-2">
          <input
            type="checkbox"
            class="form-check-input"
            id="projectInspection"
            v-model="project.isInspectionModuleEnabled"
            @change="makeDirty"
          >
          <label class="form-check-label" for="projectInspection">Enable Inspection Module</label>
          <br>
          <small>Check this if this project requires the Inspection Module. The Inspection Module is required if you want to use the Warehouse Module.</small>
        </div>
      </div>
      <div class="form-check row mb-3">
        <div class="col-sm-10 offset-md-2">
          <input
            type="checkbox"
            class="form-check-input"
            id="projectShipping"
            v-model="project.isShippingModuleEnabled"
            @change="makeDirty"
          >
          <label class="form-check-label" for="projectShipping">Enable Shipping Module</label>
          <br>
          <small>Check this if this project requires the Shipping Module.</small>
        </div>
      </div>
      <div class="form-check row mb-3">
        <div class="col-sm-10 offset-md-2">
          <input
            type="checkbox"
            class="form-check-input"
            id="projectWarehouse"
            v-model="project.isWarehouseModuleEnabled"
            @change="makeDirty"
          >
          <label class="form-check-label" for="projectWarehouse">Enable Warehouse Module</label>
          <br>
          <small>
            Check this if this project requires the Warehouse Module.
            <strong>Requires the Inspection Module to be enabled.</strong>
          </small>
        </div>
      </div>
      <div class="text-right">
        <button
          type="submit"
          class="btn btn-lg"
          v-bind:class="[project.isDirty ? 'btn-leeuwen' : 'btn-outline-leeuwen']"
          :disabled="!project.isDirty || loading"
        >
          <v-icon name="spinner" spin v-if="loading"></v-icon>Save Project
        </button>
      </div>
    </form>
    <div v-else class="text-center">
      <router-link
        tag="button"
        type="button"
        class="btn btn-leeuwen btn-lg"
        :to="{ name : 'Customer' }"
        v-if="customers.length == 0 && (roles.indexOf('Admin') >= 0 || roles.indexOf('ProjectAdmin') >= 0)"
      >
        <v-icon name="plus"></v-icon>Create Customer
      </router-link>
      <router-link
        tag="button"
        type="button"
        class="btn btn-leeuwen btn-lg"
        :to="{ name : 'Opco' }"
        v-if="opcos.length == 0 && roles.indexOf('Admin') >= 0"
      >
        <v-icon name="plus"></v-icon>Create Operating Company
      </router-link>
    </div>
  </div>
</template>

<script>
import { project, customer, oPCO, Status } from "@/models/models.js";
export default {
  name: "Project",
  props: [],
  components: {},
  data() {
    return {
      loading: false,
      project: new project({
        isInspectionModuleEnabled: true,
        isShippingModuleEnabled: true,
        isWarehouseModuleEnabled: true,
        currency: "€"
      }),
      customers: this.$store.getters.Customers,
      opcos: this.$store.getters.Opcos,
      status: new Status(),
      projects: []
    };
  },
  mounted() {
    this.project.duplicate = null;
    this.getCustomers();
    this.getOpcos();
    this.getProjects();
  },
  methods: {
    getCustomers() {
      return this.$http.get("api/Customers/All").then(res => {
        return (this.customers = res.data.map(c => {
          return new customer(c);
        }));
      });
    },
    getOpcos() {
      return this.$http.get("api/Opcos/All").then(res => {
        return (this.opcos = res.data.map(c => {
          return new oPCO(c);
        }));
      });
    },
    getProjects() {
      return this.$http.get("api/Projects").then(res => {
        if (res.data.exceptionLog.status == this.status.Success) {
          return (this.projects = res.data.responseModel.map(c => {
            return new project(c);
          }));
        } else {
          alter(res.data.exceptionLog.message);
        }
      });
    },
    makeDirty() {
      this.project.isDirty = true;
    },
    saveProject() {
      this.loading = true;
      let url = "api/projects";
      if (!!this.project.duplicate)
        url += "?duplicateId=" + this.project.duplicate;

      this.$http
        .post(url, this.project)
        .then(res => {
          this.$router.push("/");
          this.project = new project({
            isInspectionModuleEnabled: true,
            isShippingModuleEnabled: true,
            isWarehouseModuleEnabled: true,
            currency: "€"
          });
          this.project.duplicate = null;
          this.loading = false;
        })
        .catch(() => {
          alert("Failed to create project.");
          this.loading = false;
        });
    }
  },
  computed: {
    roles() {
      return this.$store.getters.roles;
    }
  }
};
</script>

<style scoped>
</style>
