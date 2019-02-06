<template>
    <div id="stocklist">
        <div class="text-right">
            <checkbox label="Include Empty Stock?" :check="includeEmptyStock" @toggle="includeEmptyStockItems" ></checkbox>
        </div>
        <table-grid id="table_stock" ref="table_stock" :options="options" :contextMenu="contextMenu"></table-grid>
        <div v-if="stockhistory.length > 0 && !!itemId">
            <hr>
            <div class="row mb-3">
                <div class="col-md-6">
                    <h4>Stock History</h4>
                </div>
                <div class="col-md-6 text-right">
                    <button class="btn btn-outline-leeuwen" :disabled="!itemId" data-target="#correctStock" data-toggle="modal">Stock Correction</button>
                    <button class="btn btn-outline-leeuwen" :disabled="!itemId" data-target="#relocateStock" data-toggle="modal">Re-locate Stock</button>
                </div>
            </div>
            <table-component :data="stockhistory" ></table-component>
        </div>
        <div class="text-center" v-if="loading">
            <v-icon name="spinner" spin scale="3"></v-icon>
        </div>

        <modal id="relocateStock" :save="relocateStock" isSmall="true">
            <template slot="title">Re-locate Stock</template>
            <template slot="body" v-if="!!item">
                <div class="row">
                    <div class="col-md-6">
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
                                <number-input :obj="item" :qty="itemQuantity" :min="1" :max="itemQuantity" class='mt-3' v-on:change="updateAllocationQuantity"></number-input>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
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
            </template>
            <template slot="buttons">
                <button class="btn btn-leeuwen" @click="undoStock">
                    <v-icon name="undo"></v-icon> Undo
                </button>
            </template>
        </modal>
        <modal id="correctStock" :save="correctStock" isSmall="true">
            <div slot="title">Correct Stock</div>
            <div slot="body" v-if="!!item">
                <label>New Stock Quantity</label>
                <number-input :obj="item" :qty="allocationQuantity" :min="0" class='mt-3' v-on:change="updateAllocationQuantity"></number-input>
            </div>
        </modal>
    </div>
</template>

<script>
import TableGrid from '@/components/TableGrid';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import NumberInput from '@/components/NumberInput';
import CheckBox from '@/components/CheckBox';
export default {
    components: {
        'table-grid': TableGrid,
        'table-component': Table,
        'modal': Modal,
        'number-input': NumberInput,
        'checkbox': CheckBox
    },
    data() {
        return {
            options: {
                api: 'api/Tables/GetAsync/' + this.$route.params.projectId + '/stock?eq=AND&filter=' + encodeURIComponent(JSON.stringify([{property:"StockItem_WarehouseLocationId", compare: 'neq', value: null }, {property:"StockItem_StockQuantity", compare: 'gt', value: 0 }])),
                saveApi: 'api/Tables/Save',
                take: 10,
                full: false,
                hidden: ["Item_Id"],
                multiple: false,
                fixed: false,
                autoSave: false,
                bulkupload: false,
            },
            loading: false,
            table: null,
            stockhistory: [],
            search: null,
            warehouseId: null,
            locationId: null,
            warehouses: [],
            locations: [],
            allocationQuantity: 0,
            includeEmptyStock: false
        }
    },
    mounted() {
        this.table = this.$refs.table_stock;
        this.getWarehouses();
    },
    methods: {
        relocateStock() {
            this.loading = true;
            let items = this.table.selectedRows.map((r) => { return { id: r.columns.find((c) => c.label.toLowerCase() == "stockitem_id").value } });
            items.forEach((i) =>
            {
                i.quantity = this.allocationQuantity;
            });
            return this.$http.post('api/Stock/StockAllocation/' + this.locationId, items).then((res) => {
                this.table.selectedRows.forEach((i) => {
                    const id = i.columns.find((c) => { return c.label.toLowerCase() == 'stockitem_id'}).value;
                    const newQty = items.find((c) => { return c.id == id }).quantity;
                    let qty = i.columns.find((c) => { return c.label.toLowerCase() == 'stockitem_stockquantity'});
                                        
                    qty.value -= newQty;
                });
                this.loading = false;
                this.getStockHistory(this.itemId);
            });
        },
        correctStock() {
            this.loading = true;
            let items = this.table.selectedRows.map((r) => { return { id: r.columns.find((c) => c.label.toLowerCase() == "stockitem_id").value } });
            items.forEach((i) =>
            {
                i.quantity = this.allocationQuantity;
            });

            return this.$http.post('api/Stock/CorrectStock/', items).then((res) => {
                this.table.selectedRows.forEach((i) => {
                    const id = i.columns.find((c) => { return c.label.toLowerCase() == 'stockitem_id'}).value;
                    const newQty = items.find((c) => { return c.id == id }).quantity;
                    let qty = i.columns.find((c) => { return c.label.toLowerCase() == 'stockitem_stockquantity'});
                                        
                    qty.value = newQty;
                });
                this.getStockHistory(this.itemId);
                this.loading = false;
            });
        },
        undoStock() {
            if(confirm("WARNING: All Stock Will Be Released From This Location."))
            {
                this.loading = true;
                let items = this.table.selectedRows.map((r) => { return { id: r.columns.find((c) => c.label.toLowerCase() == "stockitem_id").value } });
                items.forEach((i) =>
                {
                    i.quantity = this.allocationQuantity;
                });
                return this.$http.post('api/Stock/UndoAllocation/', items).then((res) => {
                    this.table.selectedRows.forEach((i) => {
                        const id = i.columns.find((c) => { return c.label.toLowerCase() == 'stockitem_id'}).value;
                        const item = items.find((c) => { return c.id == id });
                        
                        if(!item)
                            this.table.rows.splic(this.table.rows.indexOf(i), 1);
                    });
                    this.loading = false;
                    this.getStockHistory(this.itemId);
                }).catch((err) => {
                    return alert(err.data);
                });
            }
        },
        getWarehouses() {
            return this.$http.get('api/Warehouse/Warehouses/' + this.$route.params.projectId).then((res) => {
                return this.warehouses = res.data;
            })
        },
        selectLocation(location) {
            this.locationId = location.Id;
        },
        updateAllocationQuantity(qty, item)
        {
            this.allocationQuantity = qty;
        },
        getStockHistory(itemId)
        {
            this.loading = true;
            return this.$http.get('api/Stock/GetStockHistory/' + itemId).then((res) => {
                this.loading = false;
                return this.stockhistory = res.data.map((s) => {
                    return {
                        Time: this.$d(new Date(s.time), 'long'),
                        Message: s.message,
                        InStock: s.quantity,
                        Quantity: s.mutQuantity,
                        From: (!!s.fromWarehouse) ? s.fromWarehouse + ': ' + s.fromLocation : '',
                        To: (!!s.toWarehouse) ? s.toWarehouse + ': ' + s.toLocation  : '',
                        User: s.user
                    }
                });
            });
        },
        includeEmptyStockItems(obj, property, check)
        {
            this.includeEmptyStock = check;
            if(check)
            {
                this.options.api = 'api/Tables/GetAsync/' + this.$route.params.projectId + '/stock?filter=' + encodeURIComponent(JSON.stringify([{property:"StockItem_WarehouseLocationId", compare: 'neq', value: null }]));
            } else 
            {
                this.options.api = 'api/Tables/GetAsync/' + this.$route.params.projectId + '/stock?eq=AND&filter=' + encodeURIComponent(JSON.stringify([{property:"StockItem_WarehouseLocationId", compare: 'neq', value: null }, {property:"StockItem_StockQuantity", compare: 'gt', value: 0 }]));
            }
            this.table.initLoad();
        },
    },
    computed: {
        itemId() {
            if(!this.table || !this.table.selectedRows[0])
                return null;

            const item = this.table.selectedRows[0].columns.find((c) => { return c.label.toLowerCase() == "stockitem_id"});
            if(!!item)
                return item.value;
            return null;
        },
        item() {
            if(!this.table || !this.table.selectedRows[0])
                return null;

            return this.table.selectedRows[0];
        },
        itemQuantity() {
            if(!this.item)
                return 0;

            const qty = this.item.columns.find((c) => { return c.label.toLowerCase() == "stockitem_stockquantity"}).value;
            this.allocationQuantity = qty;
            return qty;
        },
        contextMenu() {
            let menu = [];
            
            if(this.table != null)
                menu.push({label: 'Refresh data', action: this.table.initLoad })

                        
            return menu;
        },
        filteredLocations() {
            if(this.search == null)
                return this.locations.filter((c, idx) => { return idx < 5 });
            return this.locations.filter((l, idx) => { 
                return idx < 5 && l.Name.toLowerCase().indexOf(this.search.toLowerCase()) >= 0 });
        }
    },
    watch: {
        itemId(to, from)
        {
            if(!!to)
            {
                this.getStockHistory(to);
            }
        },
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