<template>
<div class="row">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h5>Warehouses</h5>
            </div>
            <div class="card-body">
                <form @submit.prevent="addWarehouse">
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" >
                                <v-icon name="industry"></v-icon>
                            </span>
                        </div>
                        <input class="form-control" type="text" placeholder="Type here the name of the warehouse..." v-model="warehouse" />
                        <div class="input-group-append">
                            <button class="btn btn-outline-leeuwen" type="submit" :disabled="filteredWarehouses.length > 0"> Add Warehouse</button>
                            <button class="btn btn-leeuwen" type="button" @click="showUpload = (showUpload) ? false : true">
                                <v-icon name="file-excel"></v-icon>
                            </button>
                        </div>                
                    </div>
                </form>                        
                <file-input v-if="showUpload" :get="'api/Warehouse/Download/' + this.$route.params.projectId" :set="'api/Warehouse/Upload/' + this.$route.params.projectId" v-on:response="addMultipleWarehouses"></file-input>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Warehouse</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="w in filteredWarehouses" :key="w.id" :class="{ 'active': !!selectedWarehouse && selectedWarehouse.id == w.id }" @click="selectWarehouse(w)">
                            <td >
                                <input class="form-control-plaintext" v-model="w.name" @change="w.isDirty = true" />
                            </td>
                            <th class="text-right">
                                <button class="btn btn-sm btn-success" v-if="w.isDirty" @click="renameWarehouse(w)">
                                    <v-icon name="save"></v-icon>
                                </button>
                                <button class="btn btn-sm btn-leeuwen" @click="removeWarehouse(w)">
                                    <v-icon name="trash-alt"></v-icon>
                                </button>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-md-6" v-if="selectedWarehouse != null">
        <div class="card">
            <div class="card-header">
                <h5>Locations</h5>
            </div>
            <div class="card-body">
                <form @submit.prevent="addLocation">
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" >
                                <v-icon name="industry"></v-icon>
                            </span>
                        </div>
                        <input class="form-control" type="text" placeholder="Type here the name of the location..." v-model="location" />
                        <div class="input-group-append">
                            <button class="btn btn-outline-leeuwen" type="submit" :disabled="filteredLocations.length > 0"> Add Location</button>
                            <button class="btn btn-leeuwen" type="button" @click="showUpload = (showUpload) ? false : true">
                                <v-icon name="file-excel"></v-icon>
                            </button>
                        </div>
                    </div>
                </form>
                <file-input v-if="showUpload" :get="'api/Warehouse/Location/Download/' + selectedWarehouse.id" :set="'api/Warehouse/Location/Upload/' + selectedWarehouse.id" v-on:response="addMultipleLocation"></file-input>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="l in filteredLocations" :key="l.id">
                            <td>
                                <input class="form-control-plaintext" v-model="l.name" @change="l.isDirty = true" />
                            </td>
                            <th class="text-right">
                                <button class="btn btn-sm btn-success" v-if="l.isDirty" @click="renameLocation(l)">
                                    <v-icon name="save"></v-icon>
                                </button>
                                <button class="btn btn-sm btn-leeuwen" @click="removeLocation(l)">
                                    <v-icon name="trash-alt"></v-icon>
                                </button>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import FileInput from '@/components/FileInput'
export default {
    data() {
        return {
            warehouse: null,
            location: null,
            selectedWarehouse: null,
            warehouses: [],
            locations: [],
            showUpload: false
        }
    },
    components: {
        'file-input': FileInput
    },
    created() {
        this.getWarehouses();
    },
    methods: {
        getWarehouses() {
            return this.$http.get('api/Warehouse/Warehouses/' + this.$route.params.projectId).then((res) => {
                return this.warehouses = res.data.map((w) => { w.isDirty = false; return w; });
            })
        },
        selectWarehouse(warehouse) {
            this.selectedWarehouse = warehouse;
            return this.$http.get('api/Warehouse/WarehouseLocations/' + warehouse.id).then((res) => {
                return this.locations = res.data.map((l) => { l.isDirty = false; return l; });
            });
        },
        addWarehouse() {
            return this.$http.post('api/Warehouse/AddWarehouse/' + this.$route.params.projectId, { name: this.warehouse }).then((res) => {
                res.data.isDirty = false;
                return this.warehouses.push(res.data);
            });
        },
        removeWarehouse(warehouse) {
            return this.$http.delete('api/Warehouse/RemoveWarehouse/' + warehouse.id).then((res) => {
                return this.warehouses.splice(this.warehouses.indexOf(warehouse), 1);
            });
        },
        renameWarehouse(warehouse) {
            return this.$http.put('api/Warehouse/RenameWarehouse/' + warehouse.id, warehouse).then((res) => {
                this.selectedWarehouse = null;
                return warehouse.isDirty = false;
            });
        },
        addLocation() {
            return this.$http.post('api/Warehouse/AddLocation/' + this.selectedWarehouse.id, { name: this.location }).then((res) => {
                res.data.isDirty = false;
                return this.locations.push(res.data);
            });
        },
        removeLocation(location) {
            return this.$http.delete('api/Warehouse/RemoveLocation/' + location.id).then((res) => {
                return this.locations.splice(this.locations.indexOf(location), 1);
            });
        },
        renameLocation(location) {
            return this.$http.put('api/Warehouse/RenameLocation/' + location.id, location).then((res) => {
                return location.isDirty = false;
            });
        },
        addMultipleWarehouses(res) {
            res.forEach((l) => {
                this.warehouses.push(l);
            });
        },
        addMultipleLocation(res) {
            res.forEach((l) => {
                this.locations.push(l);
            });
        }
    },
    computed: {
        filteredWarehouses() {
            if(!this.warehouse)
                return this.warehouses;
            return this.warehouses.filter((f) => { return f.name.toLowerCase().indexOf(this.warehouse.toLowerCase()) >= 0 })
        },
        filteredLocations() {
            if(!this.location)
                return this.locations;
            return this.locations.filter((f) => { return f.name.toLowerCase().indexOf(this.location.toLowerCase()) >= 0 })
        }
    }
}
</script>

<style scoped>
.card-header h5 {
    margin: 0;
}
tr.active {
    background-color: lightgray;
}
</style>