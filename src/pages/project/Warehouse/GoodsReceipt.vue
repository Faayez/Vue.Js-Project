<template>
    <div id="goodsreceipt">
        <file-input :get="'api/Stock/GetExample'" :set="'api/Stock/Upload/' + this.$route.params.projectId" v-on:response="uploadItems"></file-input>
        <table-grid id="table_goodsreceipt" ref="table_goodsreceipt" :options="options" :contextMenu="contextMenu"></table-grid>
        <hr>
        <div class="row">
            <div class="col-md-4">
                <div class="card mb-3">
                    <div class="card-header">
                        <h5>Warehouses</h5>
                    </div>
                    <div class="card-body">
                        <div class="form-check" v-for="w in warehouses" :key="w.id">
                            <input class="form-check-input" type="radio" name="warehouses" :id="'warehouse' + w.id" :value="w.id" v-model="warehouseId">
                            <label class="form-check-label" :for="'warehouse' + w.id">
                                {{w.name}}
                            </label>
                        </div>
                    </div>
                </div>
                <div v-if="!disableAllocationButton">
                    <h3>Selected Quantities</h3>
                    <ul class="list-group mb-3">
                        <li class="list-group-item" v-for="(i, index) in selectedItems" :key="index">
                            <div class="row">
                                <div class="col-6">
                                    <span class="ellipsis">{{i.item_id}}: {{i.item_articleno}} | {{i.item_customercode}}</span>
                                </div>
                                <div class="col-6">
                                    <number-input :obj="i" :qty="i.item_quantity" :min="1" :max="i.item_quantity" v-on:change="updateAllocationQuantity"></number-input>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <button class="btn btn-leeuwen btn-full mb-3" :disabled="disableAllocationButton" @click="allocateStock">
                        Allocate {{this.selectedRows.length}} Items To {{locationName}}
                    </button>
                </div>
            </div>
            <div class="col-md-8" v-if="warehouseId != null">
                <div class="card">
                    <div class="card-header">
                        <h5>Locations</h5>
                    </div>
                    <div class="card-body">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="basic-addon1">
                                    <v-icon name="search"></v-icon>
                                </span>
                            </div>
                            <input type="text" placeholder="Search location..." class="form-control" v-model="search" />
                        </div>
                        <div class="table-box">
                            <table-component :data="filteredLocations" v-on:click="selectLocation"></table-component>
                            <div class="text-center" v-if="loading">
                                <v-icon name="spinner" spin scale="3"></v-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import TableGrid from '@/components/TableGrid';
import Table from '@/components/Table';
import FileInput from '@/components/FileInput';
import NumberInput from '@/components/NumberInput';
export default {
    name: 'goodsreceipt',
    props: [],
    components: {
        'table-grid': TableGrid,
        'table-component': Table,
        'file-input': FileInput,
        'number-input': NumberInput
    },
    data () {
        return {
            options: {
                api: 'api/Tables/GetAsync/' + this.$route.params.projectId + '/goodsreceipt?filter=' + encodeURIComponent(JSON.stringify([{property:"StockItem_WarehouseLocationId", compare: 'eq', value: null }])),
                take: 10,
                full: false,
                hidden: ["Item_Id"],
                multiple: true,
                fixed: false,
                autoSave: false,
                bulkupload: false,
            },
            search: null,
            warehouseId: null,
            locationId: null,
            warehouses: [],
            locations: [],
            table: null,
            quantity: null,
            loading: false
        }
    },
    mounted() {
        this.getWarehouses();
        this.table = this.$refs.table_goodsreceipt;
    },
    methods: {
        getWarehouses() {
            return this.$http.get('api/Warehouse/Warehouses/' + this.$route.params.projectId).then((res) => {
                return this.warehouses = res.data.map((w) => { w.isDirty = false; return w; });
            })
        },
        selectLocation(location) {
            this.locationId = location.Id;
        },
        allocateStock() {
            let items = this.selectedRows.map((r) => { return { id: r.columns.find((c) => c.label.toLowerCase() == "stockitem_id").value } });
            items.forEach((i) =>
            {
                i.quantity = this.selectedItems.find((c) => { return c.item_id == i.id }).item_quantity;
            });
            return this.$http.post('api/Stock/StockAllocation/' + this.locationId, items).then((res) => {
                this.selectedRows.forEach((i) => {
                    const id = i.columns.find((c) => { return c.label.toLowerCase() == 'stockitem_id'}).value;
                    const newQty = items.find((c) => { return c.id == id }).quantity;
                    let qty = i.columns.find((c) => { return c.label.toLowerCase() == 'stockitem_stockquantity'});
                    
                    if(qty.value == newQty)
                        return this.table.rows.splice(this.table.rows.indexOf(i), 1);
                    
                    qty.value -= newQty;
                });
            });
        },
        uploadItems(res) {
            this.table.initLoad();
        },
        updateAllocationQuantity(qty, item)
        {
            item.item_quantity = qty;
        }
    },
    computed: {
        projectId() {
            return this.$route.params.projectId;
        },
        locationName() {
            const location = this.locations.find((l) => { return l.Id == this.locationId});
            if(!!location)
                return location.Name;
        },
        filteredLocations() {
            if(this.search == null)
                return this.locations.filter((c, idx) => { return idx < 5 });;
            return this.locations.filter((l, idx) => { return idx < 5 && l.Name.toLowerCase().indexOf(this.search.toLowerCase()) >= 0 });
        },
        selectedRows() {
            if(this.table == null)
                return [];
            return this.table.selectedRows;
        },
        contextMenu() {
            let menu = [];
            
            if(this.table != null)
                menu.push({label: 'Refresh data', action: this.table.initLoad })

                        
            return menu;
        },
        selectedItems() {
            return this.selectedRows.map((r) => {
                return  {
                    item_id: r.columns.find((c) => { return c.label.toLowerCase() == "stockitem_id"}).value,
                    item_articleno: r.columns.find((c) => { return c.label.toLowerCase() == "stockitem_articleno"}).value,
                    item_customercode: r.columns.find((c) => { return c.label.toLowerCase() == "stockitem_customercode"}).value,
                    item_quantity: r.columns.find((c) => { return c.label.toLowerCase() == "stockitem_stockquantity"}).value,
                    item_maxquantity: r.columns.find((c) => { return c.label.toLowerCase() == "stockitem_stockquantity"}).value,
                    item_quantityunit: r.columns.find((c) => { return c.label.toLowerCase() == "stockitem_quantityunit"}).value
                }
            })
        },
        disableAllocationButton() {
            if(this.selectedRows.length == 0)
                return true;

            if(this.locationId == null)
                return true;

            return false;
        },
    },
    watch: {
        warehouseId(to, from) {
            this.locationId = null;
            if(to != null)
            {
                this.loading = true;
                return this.$http.get('api/Warehouse/WarehouseLocations/' + to).then((res) => {
                    this.loading = false;
                    return this.locations = res.data.map((l) => { 
                        return {
                            Id: l.id,
                            Name: l.name
                        }
                    });
                });
            } else 
            {
                return this.locations = [];
            }
        }
    }
}
</script>
<style scoped>
.card-header h5 {
    margin: 0;
}
</style>