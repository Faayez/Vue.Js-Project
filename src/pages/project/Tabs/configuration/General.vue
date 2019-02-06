<template>
    <div class="tab-pane fade show" :id="this.tab.id" role="tabpanel" >
        <div class="form-group row">
            <label for="projectName" class="col-sm-2 col-form-label">Project Name</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="projectName"  v-model="project.name" @change="updateProject" required />
            </div>
        </div>
            <div class="form-group row">
            <label for="projectCustomer" class="col-sm-2 col-form-label">Customer</label>
            <div class="col-sm-10 ">
                <select class="form-control" id="projectCustomer" v-model="project.customerId" @change="updateProject">
                    <option :key="c.id" v-for="c in customers" :value="c.id">{{c.text}}</option>
                </select>
            </div>
        </div>
        <div class="form-group row">
            <label for="projectOpco" class="col-sm-2 col-form-label">OPCO</label>
            <div class="col-sm-10">
                <select class="form-control" id="projectOpco" v-model="project.opcoId" @change="updateProject">
                    <option :key="c.id" v-for="c in opcos" :value="c.id">{{c.text}}</option>
                </select>
            </div>
        </div>
        <div class="form-group row">
            <label for="projectERP" class="col-sm-2 col-form-label">ERP System</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="projectERP" v-model="project.erp" @change="updateProject">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-sm-2 col-form-label">Currency</label>
            <div class="col-sm-10">
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="currencyOptions" id="currencyOption1" value="€" v-model="project.currency" @change="updateProject">
                    <label class="form-check-label" for="currencyOption1">€</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="currencyOptions" id="currencyOption2" value="$" v-model="project.currency" @change="updateProject">
                    <label class="form-check-label" for="currencyOption2">$</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="currencyOptions" id="currencyOption3" value="S$" v-model="project.currency" @change="updateProject">
                    <label class="form-check-label" for="currencyOption3">S$</label>
                </div>
            </div>
        </div>
        <div class="form-check row  mb-3">
            <div class="col-sm-10 offset-sm-2">
                <input type="checkbox" class="form-check-input" id="projectInspection" v-model="project.isInspectionModuleEnabled" disabled>
                <label class="form-check-label" for="projectInspection">
                    Enable Inspection Module
                </label><br />
                <small>Check this if this project requires the Inspection Module. The Inspection Module is required if you want to use the Warehouse Module.</small>
            </div>
        </div>
        <div class="form-check row  mb-3">
            <div class="col-sm-10 offset-sm-2">
                <input type="checkbox" class="form-check-input" id="projectShipping" v-model="project.isShippingModuleEnabled" disabled>
                <label class="form-check-label" for="projectShipping">
                    Enable Shipping Module
                </label><br />
                <small>Check this if this project requires the Shipping Module.</small>
            </div>
        </div>
        <div class="form-check row mb-3">
            <div class="col-sm-10 offset-sm-2">
                <input type="checkbox" class="form-check-input" id="projectWarehouse" v-model="project.isWarehouseModuleEnabled" disabled>
                <label class="form-check-label" for="projectWarehouse">
                    Enable Warehouse Module
                </label><br />
                <small>Check this if this project requires the Warehouse Module. <strong>Requires the Inspection Module to be enabled.</strong></small>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: '',
        props: ['tab'],
        data() {
            return {
                project: {},
                customers: [],
                opcos: []
            }
        },
        mounted() {
            if(this.$store.getters.project == null) {
                this.$store.dispatch("GET_PROJECT", this.$route.params.projectId).then((res) => {
                    this.project = Object.assign({}, res.data.project);
                });
            } else {
                this.project = Object.assign({}, this.$store.getters.project);
            };

            this.$store.dispatch("GET_OPTIONS", "Customers").then((options) => {
                this.customers = options;
            });
            this.$store.dispatch("GET_OPTIONS", "Opcos").then((options) => {
                this.opcos = options;
            });
            /*
            this.$http.get('api/Customers/All').then((res) => {
                this.customers = res.data;
            });
            
            this.$http.get('api/Opcos/All').then((res) => {
                this.opcos = res.data;
            });
            */
        },
        methods: {
            updateProject() {
                this.$store.dispatch("SET_PROJECT", this.project);
            }
        },
        computed: {
        }
    }
</script>

<style scoped>
</style>