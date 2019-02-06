<template>
    <div id="shippings">
        <h2>Shippings</h2>
        <div class="row">
            <div class="col-md-12 mb-3">
                <div class="packinglist" >
                    <div class="input-group"  > 
                        <input class="form-control" type="number" :disabled="disableCreatePackingListBtn" v-model="nextPackingListNo" />
                        <div class="input-group-append">
                            <button class="btn btn-leeuwen" v-if="!packingListNo" :disabled="disableCreatePackingListBtn" @click="createPackingListNo" >
                                <v-icon name="search" ></v-icon> Assign PackingList
                            </button> 
                            <button class="btn btn-leeuwen" v-if="!!packingListNo" :disabled="disableClearPackingListBtn" @click="clearPackingListNo" >
                                <v-icon name="trash-alt"></v-icon> Clear PackingList
                            </button> 
                        </div>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-outline-leeuwen-blue" data-target="#splitShippingModal" data-toggle="modal" :disabled="disableSplitLineBtn">
                        <v-icon name="divide"></v-icon> Split Line
                    </button>
                </div>
            </div>
        </div>
        <table-grid id="table_shipping" ref="table_shipping" :options="options" :contextMenu="contextMenu"></table-grid>

        <hr>
        <div v-show="!!packingListNo">
            <h3>Packages For PackingList: {{packingListNo}}</h3>
            <div class="row form-group">
                <div class="col-md-6">
                    <button class="btn btn-leeuwen" :disabled="!!packingListDate" data-target="#packageShippingModal" data-toggle="modal" v-if="!selectedPackage">
                        <v-icon name="plus" ></v-icon> Add Package
                    </button>
                    <button class="btn btn-leeuwen" :disabled="!!packingListDate" @click="removePackage" v-if="!!selectedPackage">
                        <v-icon name="trash-alt" ></v-icon> Remove Package
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-outline-leeuwen-blue" data-target="#shippingDocumentsModal" data-toggle="modal">
                            <v-icon name="download" ></v-icon>
                        </button>
                        <button class="btn btn-outline-leeuwen-blue" data-target="#itemsShippingModal" data-toggle="modal" :disabled="!selectedPackage">
                            <v-icon name="cubes" ></v-icon> Items
                        </button> 
                    </div>
                </div>
                <div class="col-md-6">
                    <update-all :table="tablePackages"></update-all>
                </div> 
            </div>
            <table-grid id="table_shippingPackages" ref="table_shippingPackages" :options="optionsPackages" :contextMenu="contextMenu" @update="updateVolume"></table-grid>

            <new-package-modal :packingList="packingList"></new-package-modal>
            <items-modal :shippingPackage="selectedPackage"></items-modal>
            <shipping-documents-modal :packingListNo="packingListNo"></shipping-documents-modal>
        </div>

        <split-line-modal :data="shipping" v-if="shipping.length === 1" v-on:reload="reload"></split-line-modal>
    </div>
</template>
<script>
import moment from 'moment';
import TableGrid from '@/components/TableGrid';
import SplitLineShipping from '@/pages/project/modals/SplitLineShipping';
import Items from '@/pages/project/modals/Items';
import ShippingDocuments from '@/pages/project/modals/ShippingDocuments';
import ShippingPackage from '@/pages/project/modals/ShippingPackage';
import UpdateAll from '@/components/UpdateAll';
export default {
    name: 'shippings',
    props: [],
    components: {
        'table-grid': TableGrid,
        'split-line-modal': SplitLineShipping,
        'items-modal': Items,
        'shipping-documents-modal': ShippingDocuments,
        'new-package-modal': ShippingPackage,
        'update-all': UpdateAll
    },
    data () {
        return {
            options: {
                api: 'api/Tables/GetAsync/' + this.$route.params.projectId + '/shipping' + this.$route.params.type.toUpperCase() + '?filter=' + encodeURIComponent(JSON.stringify([{property:"Shipping_Type",value: this.$route.params.type.toUpperCase() }])),
                saveApi: 'api/Tables/Save',
                downloadApi: 'api/Tables/GetCSV/' + this.$route.params.projectId + '/table_shippings/',
                take: 10,
                full: false,
                hidden: [],
                multiple: true,
                fixed: false,
                autoSave: true,
                bulkupload: true
            },
            optionsPackages: {
                api: null,
                saveApi: 'api/Tables/Save',
                take: 10,
                full: false,
                hidden: [],
                multiple: false,
                fixed: false,
                autoSave: true,
                bulkupload: true,
                select: []
            },
            table: null,
            tablePackages: null,
            locked: [],
            isLocked: true,
            nextPackingListNo: null
        }
    },
    created() {
        this.getNextPackingListNo();
        this.getShippingPackageTypes();
    },
    mounted() {
        this.table = this.$refs.table_shipping;
        this.tablePackages = this.$refs.table_shippingPackages;
    },
    methods: {
        getShippingPackageTypes() {
            this.$store.dispatch("GET_OPTIONS", "ShippingPackage_ShippingPackageTypeId").then((options) => {
                if(!this.optionsPackages.select.some((c) => { return c.id == "ShippingPackage_ShippingPackageTypeId" }))
                {
                    this.optionsPackages.select.push(
                    {
                        id: "ShippingPackage_ShippingPackageTypeId",
                        values: options
                    });
                };
            });
        },
        createPackingListNo() {
            let ship = [];
            this.selectedRows.forEach((row) => {
                let col = row.columns.find((c) => { return c.label.toLowerCase() === "shipping_id" });

                if(row.columns.some((c) => { return c.label.toLowerCase() === "shipping_packinglistno" && c.value == 0 }))
                    ship.push(parseInt(col.value));
            });
            this.$http.post('api/Shippings/CreatePackingListNo?packingListNo=' + this.nextPackingListNo, ship).then((res) => 
            {
                this.selectedRows.forEach((row) => {
                    let col = row.columns.find((c) => { return c.label.toLowerCase() === "shipping_id" });
                    if(!!col)
                    {
                        if(ship.indexOf(col.value) >= 0)
                        {
                            col = row.columns.find((c) => { return c.label.toLowerCase() === "shipping_packinglistno" });
                            if(!!col)
                                col.value = this.nextPackingListNo;
                        }
                    }
                });
                this.getNextPackingListNo();
            }).catch((err) => {
                alert(err.data);
            });
        },
        clearPackingListNo() {
            let ship = [];
            this.selectedRows.forEach((row) => {
                let col = row.columns.find((c) => { return c.label.toLowerCase() === "shipping_id" });
                ship.push(parseInt(col.value));
            });
            this.$http.post('api/Shippings/CreatePackingListNo?packingListNo=0', ship).then((res) => 
            {
                this.selectedRows.forEach((row) => {
                    let col = row.columns.find((c) => { return c.label.toLowerCase() === "shipping_id" });
                    if(!!col)
                    {
                        if(ship.indexOf(col.value) >= 0)
                        {
                            col = row.columns.find((c) => { return c.label.toLowerCase() === "shipping_packinglistno" });
                            if(!!col)
                                col.value = 0;

                            col = row.columns.find((c) => { return c.label.toLowerCase() === "shipping_packinglistdate" });
                            if(!!col)
                                col.value = null;
                        }
                    }
                });
                this.getNextPackingListNo();
            }).catch((err) => {
                alert(err.data);
            });
        },
        removePackage() {
            if(!!this.packingListDate)
                return alert("Packinglist Is Already Printed. Can Not Remove This.");

            if(confirm("Are You Sure To Remove This Package?")) {
                this.$http.delete('api/ShippingPackages/' + this.selectedPackageId).then((res) => {
                    this.tablePackages.rows.splice(this.tablePackages.rows.indexOf(this.selectedPackage), 1);
                }).catch((err) => {
                    alert(err.data);
                });
            };
        },
        reload() {
            this.table.load().then((res) => {
                this.table.loadRows(res.data.data);
            })
        },
        getNextPackingListNo() {
            this.$http.get('api/Shippings/NextPackingListNo/' + this.projectId).then((res) => {
                this.nextPackingListNo = res.data;
            });
        },
        updateVolume(col)
        {
            if(col.label.toLowerCase() == "shippingpackage_length" || col.label.toLowerCase() == "shippingpackage_width" || col.label.toLowerCase() == "shippingpackage_height")
            {
                const row = this.tablePackages.rows.find((c) => { return c.columns.indexOf(col) >= 0 });
                let c = row.columns.find((c) => { return c.label.toLowerCase() == "shippingpackage_volume"});
                if(!!c)
                {
                    const length = row.columns.find((c) => { return c.label.toLowerCase() == "shippingpackage_length"});
                    const width = row.columns.find((c) => { return c.label.toLowerCase() == "shippingpackage_width"});
                    const height = row.columns.find((c) => { return c.label.toLowerCase() == "shippingpackage_height"});
                    if(!!length && !!width && !!height)
                        c.value = length.value * width.value * height.value;
                }
            }
        }
    },
    computed: {
        projectId() {
            return this.$route.params.projectId;
        },
        type() {
            return this.$route.params.type;
        },
        shippingId() {
            if(this.selectedRows[0] != null) {
                return this.selectedRows[0].columns.find((c) => { return c.label.toLowerCase() == "shipping_id"}).value;
            };
            return null;
        },
        packingList() {
            if(this.selectedRows.length > 0) {
                let value = null;
                this.selectedRows.forEach((row) => {
                    const col = row.columns.find((c) => { return c.label.toLowerCase() == "shipping_packinglistno" && c.value > 0 });
                    if(!!col)
                    {
                        if(!value)
                            value = row;
                    }
                });
                return value;
            };
            return null;
        },
        packingListNo() {
            if(!!this.packingList) {
                const col = this.packingList.columns.find((c) => { return c.label.toLowerCase() == "shipping_packinglistno" });
                if(!!col)
                {
                    return col.value;
                }
            };
            return null;
        },
        packingListDate() {
            if(!!this.packingList) {
                const col = this.packingList.columns.find((c) => { return c.label.toLowerCase() == "shipping_packinglistdate" });
                if(!!col)
                {
                    return col.value;
                }
            };
            return null;
        },
        selectedPackage() {
            if(this.tablePackages != null && this.tablePackages.selectedRows.length > 0)
            {
                return this.tablePackages.selectedRows[0];
            }
            return null;
        },
        selectedPackageId() {
            if(this.selectedPackage != null)
            {
                const col = this.selectedPackage.columns.find((c) => { return c.label.toLowerCase() == "shippingpackage_id" });
                if(!!col)
                    return col.value;
            }
            return null;
        },
        disableCreatePackingListBtn() {
            if(this.selectedRows.length >= 1)
            {
                return this.selectedRows.some((c) => { return c.columns.some((i) => { return i.label.toLowerCase() == 'shipping_packinglistno' && i.value > 0 }) });
                
            }
            return true; 
        },
        disableClearPackingListBtn() {
            if(this.selectedRows.length >= 1)
            {
                return this.selectedRows.some((c) => { return c.columns.some((i) => { return i.label.toLowerCase() == 'shipping_packinglistno' && i.value == 0 }) });
                
            }
            return true; 
        },
        disableSplitLineBtn() {
            if(this.selectedRows.length == 1) 
            {
                return this.selectedRows.some((c) => { return c.columns.some((i) => { return i.label.toLowerCase() == 'shipping_packinglistno' && i.value > 0 }) });
            }
            return true;  
        },
        showPackingListBtn() {
            if(this.selectedRows.length == 1) 
            {
                if(this.selectedRows[0].columns.some((c) => { return c.label.toLowerCase() == 'shipping_packinglistno' && c.value > 0  }))
                {
                    return true;
                }
            }
            return false;  
        },
        shipping() {
            if(this.selectedRows.length === 1) {
                let obj = {};
                this.selectedRows[0].columns.forEach((c) => 
                {
                    if(c.label.toLowerCase() == "shipping_id"
                        || c.label.toLowerCase() == "shipping_packinglistno"
                        || c.label.toLowerCase() == "shipping_quantity"
                        || c.label.toLowerCase() == "shipping_comments"
                        || c.label.toLowerCase() == "projectorder_customerorderno"
                        || c.label.toLowerCase() == "projectorderline_customercode"
                        || c.label.toLowerCase() == "projectorderline_item"
                        || c.label.toLowerCase() == "inspection_nfino"
                        || c.label.toLowerCase() == "projectorderline_sapsalesno"
                        || c.label.toLowerCase() == "projectorderline_sapsaleslineno"
                    )
                    {
                        obj[c.label] = c.value;
                    }
                });
                return [obj];
            } else {
                return [];
            }
        },
        role() {
            return this.$store.getters.role;
        },
        roles() {
            return this.$store.getters.roles;
        },
        selectedRows() {
            if(this.table != null && this.table.selectedRows.length > 0) {
                return this.table.selectedRows;
            };
            return [];
        },
        contextMenu() {
            let menu = [];
            
            if(this.table != null)
                menu.push({label: 'Refresh data', action: this.table.initLoad })

            /*
            if(this.isLocked && this.role.toLowerCase() == "admin")
                menu.push({label: 'Unlock', action: this.unlock })
                
            if(!this.isLocked && this.role.toLowerCase() == "admin")
                menu.push({label: 'Lock', action: this.lock })
            */
           
            if(!this.disableCreatePackingListBtn)
                menu.push({ label: 'Assign PackingListNo', action: this.createPackingListNo })
                        
            if(!this.disableSplitLineBtn)
                menu.push({ label: 'Split Line', action: () => { return document.querySelector("button[data-target='#splitShippingModal']").click() } })
                        
            if(!this.disableSplitLineBtn)
                menu.push({ label: 'Items', action: () => { return document.querySelector("button[data-target='#itemsShippingModal']").click() } })
            return menu;
        }
    },
    watch: {
        type(to)
        {
            this.options.api = 'api/Tables/GetAsync/' + this.$route.params.projectId + '/shipping?filter=' + encodeURIComponent(JSON.stringify([{property:"Shipping_Type",value: this.type.toUpperCase() }]));
            this.table.initLoad();
        },
        packingListNo(to)
        {
            if(to != null)
            {
                this.optionsPackages.api = "api/Tables/GetAsync/" + this.$route.params.projectId + '/shippingPackages?filter=' + encodeURIComponent(JSON.stringify([{property:"Shipping_PackingListNo",value: to }]));
                this.tablePackages.initLoad();
            }
        }
    }
}
</script>
<style scoped>
.inline {
    display: inline-block;
}
.inline .form-check {
    padding-left: 0;
}

.packinglist {
    display: inline-block;
    vertical-align: middle;
}
.packinglist input {
    width: 75px;
}
</style>