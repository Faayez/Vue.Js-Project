<template>
  <div>
    <card>
      <template slot="card-header">
        <div class="row">
          <div
            :class="[ roles.indexOf('Admin') >= 0 || roles.indexOf('ProjectAdmin') >= 0 ? 'col-8' : 'col-12' ]"
          >
            <router-link tag="a" :to="{ name: type, params: { id: property.id }}">{{property.text}}</router-link>
          </div>
          <div
            class="col-4 text-right"
            v-if="roles.indexOf('Admin') >= 0 || roles.indexOf('ProjectAdmin') >= 0"
          >
            <div class="modal-link" data-target="#projectModal" data-toggle="modal">
              <v-icon name="plus" class="red"></v-icon>
            </div>
          </div>
        </div>
      </template>
      <template slot="card-body">
        <div class="form-group input-group-lg">
          <input class="form-control text-center" placeholder="Filter projects..." v-model="filter">
        </div>
        <loader :loading="loading"></loader>
        <div class="list-group">
          <router-link
            tag="a"
            :to="{ name: 'Project', params: { projectId: project.id }}"
            class="list-group-item list-group-item-action"
            :key="project.id"
            v-for="(project, index) in filteredProjects"
            v-if="index < showIndex"
          >
            <span class="ellipsis">{{project.id}} - {{project.text}}</span>
          </router-link>
          <div
            class="list-group-item list-group-item-action text-center"
            @click="showIndex = 999"
            v-if="showIndex < projects.length"
          >
            <v-icon name="angle-down"></v-icon>
          </div>
        </div>
      </template>
    </card>

    <modal id="projectModal" :save="saveProject" :isSmall="true">
      <template slot="title">Create new project for {{property.text}}</template>
      <template slot="body">
        <div class="form-group row">
          <label for="duplicate" class="col-sm-5 col-form-label">Clone</label>
          <div class="col-sm-7">
            <select
              type="text"
              class="form-control"
              id="duplicate"
              v-model="duplicate"
              @change="duplicateProject(duplicate)"
            >
              <option value="null">New empty project</option>
              <option :value="p.id" v-for="p in projects" :key="p.id">{{p.id}} - {{p.text}}</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <label for="projectNo" class="col-sm-5 col-form-label">Project Name</label>
          <div class="col-sm-7">
            <input type="text" class="form-control" id="projectNo" v-model="project.name" required>
          </div>
        </div>
        <div class="form-group row">
          <label for="projectErp" class="col-sm-5 col-form-label">ERP System</label>
          <div class="col-sm-7">
            <input type="text" class="form-control" id="projectErp" v-model="project.erp">
          </div>
        </div>
        <div class="form-group row">
          <label for="projectOpco" class="col-sm-5 col-form-label">Operating Company</label>
          <div class="col-sm-7">
            <select type="text" class="form-control" id="projectOpco" v-model="project.opcoId">
              <option
                :value="opco.id"
                :key="opco.id"
                v-for="opco in $store.getters.Opcos"
              >{{opco.text}}</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <label for="projectOpco" class="col-sm-5 col-form-label">Customer</label>
          <div class="col-sm-7">
            <select type="text" class="form-control" id="projectOpco" v-model="project.customerId">
              <option
                :value="customer.id"
                :key="customer.id"
                v-for="customer in $store.getters.Customers"
              >{{customer.text}}</option>
            </select>
          </div>
        </div>
        <div class="form-check row mb-3">
          <div class="col-sm-12">
            <input
              type="checkbox"
              class="form-check-input"
              id="projectInspection"
              v-model="project.isInspectionModuleEnabled"
            >
            <label class="form-check-label" for="projectInspection">Enable Inspection Module</label>
            <br>
            <small>Check this if this project requires the Inspection Module. The Inspection Module is required if you want to use the Warehouse Module.</small>
          </div>
        </div>
        <div class="form-check row mb-3">
          <div class="col-sm-12">
            <input
              type="checkbox"
              class="form-check-input"
              id="projectShipping"
              v-model="project.isShippingModuleEnabled"
            >
            <label class="form-check-label" for="projectShipping">Enable Shipping Module</label>
            <br>
            <small>Check this if this project requires the Shipping Module.</small>
          </div>
        </div>
        <div class="form-check row mb-3">
          <div class="col-sm-12">
            <input
              type="checkbox"
              class="form-check-input"
              id="projectWarehouse"
              v-model="project.isWarehouseModuleEnabled"
            >
            <label class="form-check-label" for="projectWarehouse">Enable Warehouse Module</label>
            <br>
            <small>
              Check this if this project requires the Warehouse Module.
              <strong>Requires the Inspection Module to be enabled.</strong>
            </small>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import Loader from "@/components/Loader";
import { project,Status } from "@/models/models.js";
export default {
  props: ["property", "type"],
  components: {
    card: Card,
    modal: Modal,
    loader: Loader
  },
  data() {
    return {
      projects: [],
      filter: null,
      duplicate: null,
      project: new project({}),
      showIndex: 5,
      status: new Status(),
      loading: true
    };
  },
  mounted() {
    this.getProjects();
  },
  methods: {
    getProjects() {
      this.$http
        .get("api/Projects/" + this.type + "/" + this.property.id)
        .then(res => {
          if (res.data.exceptionLog.status == this.status.Success) {
            this.projects = res.data.responseModel;
          } else {
            alter(res.data.exceptionLog.message);
          }

          this.loading = false;
        })
        .catch(err => {
          return (this.loading = false);
        });
    },
    duplicateProject(duplicate) {
      var d = this.projects.find(c => {
        return c.id == this.duplicate;
      });
      this.project.name = d.text + " (duplicate)";
    },
    saveProject() {
      const query =
        this.duplicate != null ? "?duplicateId=" + this.duplicate : "";
      return this.$http.post("api/Projects" + query, this.project).then(res => {
        this.project = new project({});
        if (res.data.exceptionLog.status == this.status.Success) {
          this.projects.unshift({
            id: res.data.responseModel.id,
            text: res.data.responseModel.name
          });
          document
            .getElementById("projectModal")
            .querySelector("button[data-dismiss=modal]")
            .click();
        } else {
          alter(res.data.exceptionLog.message);
        }
      });
    }
  },
  computed: {
    roles() {
      return this.$store.getters.roles;
    },
    filteredProjects() {
      if (this.projects.length > 0) {
        if (!this.filter) return this.projects;

        return this.projects.filter(c => {
          return c.text.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0;
        });
      } else {
        return [];
      }
    }
  }
};
</script>