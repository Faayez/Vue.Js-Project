<template>
    <div id="inspections">
            <h2>Inspection</h2>
            <h3>
                Projectorderlines <checkbox label="Include Released?" :check="includeReleased" @toggle="includeReleasedItems" class="inline right"></checkbox>
            </h3>
            <table-grid id="table_inspectionExpediting" ref="table_inspectionExpediting" :options="lineOptions" :contextMenu="contextMenu"></table-grid>
            <hr>
            <div v-show="expeditingId.length > 0">
                <h3>Inspections</h3>
                <div class="row" >
                    <div class="col-md-6 mb-3">
                        <div class="nfi" >
                            <div class="input-group"  > 
                                <input class="form-control" type="number" :disabled="disableCreateNfiBtn" v-model="nextNFI" />
                                <div class="input-group-append">
                                    <button class="btn btn-leeuwen" v-if="showAssignNfiBtn" :disabled="disableCreateNfiBtn" @click="createNFI">
                                        <v-icon name="search" ></v-icon> Assign NFI
                                    </button> 
                                    <button class="btn btn-leeuwen" @click="clearNFI" v-if="!showAssignNfiBtn" :disabled="isReleased">
                                        <v-icon name="trash-alt"></v-icon> Clear NFI
                                    </button> 
                                </div>
                            </div>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-outline-leeuwen-blue" data-target="#splitInspectionModal" data-toggle="modal" :disabled="disableSplitLineBtn">
                                <v-icon name="divide"></v-icon> Split Line
                            </button>
                            <button class="btn btn-outline-leeuwen-blue" data-target="#inspectionCertificatesModal" data-toggle="modal" :disabled="selectedRows.length !== 1">
                                <v-icon name="certificate"></v-icon> Certificates
                            </button>
                            <button class="btn btn-outline-leeuwen-blue" :disabled="selectedRows.length == 0" data-target="#inspectionDocumentsModal" data-toggle="modal">
                                <v-icon name="download" ></v-icon>
                            </button>
                            <button class="btn btn-outline-leeuwen-blue" v-if="!isReleased" :disabled="!showReleaseBtn" @click="releaseInspection">
                                <v-icon name="lock"></v-icon> Release
                            </button>
                            <button class="btn btn-outline-leeuwen-blue" v-if="isReleased" @click="undoReleaseInspection">
                                <v-icon name="undo"></v-icon> Undo
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <update-all :table="table"></update-all>
                    </div> 
                </div>
                <table-grid id="table_inspection" ref="table_inspection" :options="options" :contextMenu="contextMenu" @update="update"></table-grid>
                <split-line-modal :data="projectOrderLine" v-if="projectOrderLine.length === 1" v-on:reload="reload"></split-line-modal>
                <certificates-modal v-if="selectedRows.length === 1" :inspectionId="inspectionId"></certificates-modal>
                <inspection-documents-modal :nfiNo="nfiNo"></inspection-documents-modal>
            </div>
    </div>
</template>
<script>
import moment from 'moment';
import TableGrid from '@/components/TableGrid';
import SplitLineInspection from '@/pages/project/modals/SplitLineInspection';
import InspectionCertificates from '@/pages/project/modals/InspectionCertificates';
import InspectionDocuments from '@/pages/project/modals/InspectionDocuments';
import UpdateAll from '@/components/UpdateAll';
import CheckBox from '@/components/CheckBox';
export default {
    name: 'inspections',
    props: [],
    components: {
        'table-grid': TableGrid,
        'split-line-modal': SplitLineInspection,
        'certificates-modal': InspectionCertificates,
        'inspection-documents-modal': InspectionDocuments,
        'update-all': UpdateAll,
        'checkbox': CheckBox
    },
    data () {
        return {
            options: {
                api: null,
                saveApi: 'api/Tables/Save',
                downloadApi: 'api/Tables/GetCSV/' + this.$route.params.projectId + '/table_inspections/',
                take: 10,
                full: false,
                hidden: ["id", "expeditingId", "projectOrderLineId"],
                multiple: true,
                fixed: false,
                autoSave: true,
                bulkupload: true,
            },
            lineOptions: {
                api: 'api/Tables/GetAsync/' + this.$route.params.projectId + '/inspectionExpediting?filter=' + encodeURIComponent(JSON.stringify([{property:"Inspection_IsReleased",value: false }])),
                take: 10,
                full: false,
                hidden: [],
                multiple: true,
                fixed: true,
                autoSave: false,
            },
            table: null,
            lineTable: null,
            locked: [],
            isLocked: true,
            nextNFI: null,
            includeReleased: false,
        }
    },
    created() {
        this.getNextNFINo();
    },
    mounted() {
        this.table = this.$refs.table_inspection;
        this.lineTable = this.$refs.table_inspectionExpediting;
    },
    methods: {
        createNFI() {
            if(!this.isReleased)
            {
                let insp = [];
                this.selectedRows.forEach((row) => {
                    let col = row.columns.find((c) => { return c.label.toLowerCase() === "inspection_id" });
                    insp.push(parseInt(col.value));
                });
                this.$http.post('api/Inspections/CreateNFI?nfiNo=' + this.nextNFI, insp).then((res) => 
                {
                    this.selectedRows.forEach((row) => {
                        let col = row.columns.find((c) => { return c.label.toLowerCase() === "inspection_id" });
                        if(insp.indexOf(col.value) >= 0)
                        {
                            col = row.columns.find((c) => { return c.label.toLowerCase() === "inspection_nfino" });
                            if(!!col)
                                col.value = this.nextNFI;
                        }
                    });
                    this.getNextNFINo();
                });
            };
        },
        clearNFI() {
            if(!this.isReleased)
            {
                let insp = [];
                this.selectedRows.forEach((row) => {
                    let col = row.columns.find((c) => { return c.label.toLowerCase() === "inspection_id" });
                    insp.push(parseInt(col.value));
                });
                this.$http.post('api/Inspections/CreateNFI?nfiNo=0', insp).then((res) => 
                {
                    this.selectedRows.forEach((row) => {
                        let col = row.columns.find((c) => { return c.label.toLowerCase() === "inspection_id" });
                        if(insp.indexOf(col.value) >= 0)
                        {
                            col = row.columns.find((c) => { return c.label.toLowerCase() === "inspection_nfino" });
                            if(!!col)
                                col.value = 0;
                        }
                    });

                    this.nextNFI = res.data;
                    this.getNextNFINo();
                });
            };
        },
        reload() {
            this.table.load().then((res) => {
                this.table.loadRows(res.data.data);
            })
        },
        getNextNFINo() {
            this.$http.get('api/Inspections/NextNFI/' + this.projectId).then((res) => {
                this.nextNFI = res.data;
            });
        },
        includeReleasedItems(obj, property, check)
        {
            this.includeReleased = check;
            if(check)
            {
                this.lineOptions.api = 'api/Tables/GetAsync/' + this.$route.params.projectId + '/inspectionExpediting';
            } 
            else {
                this.lineOptions.api = 'api/Tables/GetAsync/' + this.$route.params.projectId + '/inspectionExpediting?filter=' + encodeURIComponent(JSON.stringify([{property:"Inspection_IsReleased",value: false }]));
            }
            this.lineTable.initLoad();
        },
        releaseInspection()
        {
            if(!this.isReleased)
            {
                this.selectedRows.forEach((row) => {
                   
                    const nfi = row.columns.find((i) => { return i.label.toLowerCase() == 'inspection_nfino' });
                    if(nfi.value == 0 || !nfi.value)
                        return alert("Please assign NFI No first.");

                    const date = row.columns.find((i) => { return i.label.toLowerCase() == 'inspection_datereleasedbyinspection' });
                    if(!date.value)
                        return alert("Inspection Release Date can not be empty.");

                    const relqty = row.columns.find((i) => { return i.label.toLowerCase() == 'inspection_releasedquantity' });
                    const qty = row.columns.find((i) => { return i.label.toLowerCase() == 'inspection_quantity' });
                    if((relqty.value <= 0 || !relqty.value) && qty.value > 0)
                        return alert("Released Quantity must be greater than 0.");

                    const id = row.columns.find((i) => { return i.label.toLowerCase() == 'inspection_id' });
                    this.$http.post('api/Inspections/Release/' + id.value).then((res) => {
                        let col = row.columns.find((i) => { return i.label.toLowerCase() == 'inspection_isreleased' });
                        if(!!col)
                            col.value = true;
                    })
                    .catch((err) => {
                        alert(err.data);
                    })
                });
            }
        },
        undoReleaseInspection() 
        {
            if(this.isReleased)
            {
                this.selectedRows.forEach((row) => {
                    const id = row.columns.find((i) => { return i.label.toLowerCase() == 'inspection_id' });
                    this.$http.post('api/Inspections/UndoRelease/' + id.value).then((res) => {
                        let col = row.columns.find((i) => { return i.label.toLowerCase() == 'inspection_isreleased' });
                        if(!!col)
                            col.value = false;
                    })
                    .catch((err) => {
                        alert(err.data);
                    })
                });
            };
        },
        update(col)
        {
            if(col.label.toLowerCase() == "inspection_datereleasedbyinspection")
            {
                const row = this.table.rows.find((c) => { return c.columns.indexOf(col) >= 0 });
                let c = row.columns.find((c) => { return c.label.toLowerCase() == "inspection_releasedquantity"});
                if(!!c)
                {
                    if(c.value == 0 || !c.value)
                    {
                        const qty = row.columns.find((c) => { return c.label.toLowerCase() == "inspection_quantity"});
                        if(!!qty)
                            c.value = qty.value;
                    }
                }
            }
        }
    },
    computed: {
        projectId() {
            return this.$route.params.projectId;
        },
        expeditingId() {
            let array = [];
            if(this.lineTable != null && this.lineTable.selectedRows.length > 0) {
                this.lineTable.selectedRows.forEach((c) => {
                    const col = c.columns.find((c) => { return c.label.toLowerCase() == "inspection_expeditingid" });
                    if(!!col)
                        return array.push(col.value);
                })
            };
            return array;
        },
        inspectionId() {
            if(this.selectedRows[0] != null) {
                return this.selectedRows[0].columns.find((c) => { return c.label.toLowerCase() == "inspection_id"}).value;
            };
            return null;
        },
        nfiNo() {
            if(this.selectedRows[0] != null) {
                return this.selectedRows[0].columns.find((c) => { return c.label.toLowerCase() == "inspection_nfino"}).value;
            };
            return null;
        },
        disableCreateNfiBtn() {
            if(this.selectedRows.length >= 1 && !this.isReleased)
            {
                const nfi = this.selectedRows.some((c) => { return c.columns.some((i) => { return i.label.toLowerCase() == 'inspection_nfino' && i.value != 0 }) });
                //let hasNfi = (this.selectedRows[0].cols.some((c) => { return c.propertyName.toLowerCase() == 'inspection_nfino' && c.text == null })) ? false : true;
                if(!nfi)
                    return false;
            }
            return true;  
        },
        disableSplitLineBtn() {
            if(this.table != null) {
                if(this.selectedRows.some((r) => { 
                    return r.columns.some((c) => { 
                        return c.label.toLowerCase() == "inspection_datereleasedbyinspection" && !c.value
                    }) && r.columns.some((c) => { 
                        return c.label.toLowerCase() == "inspection_releasedquantity" && !c.value
                    }); 
                }) && this.selectedRows.length === 1) 
                {
                    return false;
                }
            };
            return true;    
        },
        inspection() {
            if(this.selectedRows.length > 0) {
                let obj = {};
                this.selectedRows[0].columns.forEach((c) => 
                {
                    if(c.label.toLowerCase() == "inspection_id")
                        obj.id = c.value;
                    if(c.label.toLowerCase() == "projectorderline_id")
                        obj.projectOrderLineId = c.value;
                    if(c.label.toLowerCase() == "projectorder_customerorderno")
                        obj.customerOrderNo = c.value;
                    if(c.label.toLowerCase() == "projectorderline_customercode")
                        obj.customerCode = c.value;
                    if(c.label.toLowerCase() == "projectorderline_rev")
                        obj.rev = c.value;
                    if(c.label.toLowerCase() == "expediting_quantity")
                        obj.orderQuantity = c.value;
                    if(c.label.toLowerCase() == "projectorderline_quantityunit")
                        obj.quantityUnit = c.value;
                });
                return [obj];
            } else {
                return [];
            }
        },
        roles() {
            return this.$store.getters.roles;
        },
        projectOrderLine() {
            if(this.selectedRows.length === 1) {
                let obj = {};
                this.selectedRows[0].columns.forEach((c) => 
                {
                    if(c.label.toLowerCase() == "inspection_id"
                    || c.label.toLowerCase() == "projectorderline_id"
                    || c.label.toLowerCase() == "expediting_id"
                    || c.label.toLowerCase() == "projectorder_customerorderno"
                    || c.label.toLowerCase() == "projectorderline_rev"
                    || c.label.toLowerCase() == "inspection_nfino"
                    || c.label.toLowerCase() == "projectorderline_quantity"
                    || c.label.toLowerCase() == "expediting_quantity"
                    || c.label.toLowerCase() == "projectorderline_quantityunit"
                    )
                    {
                       obj[c.label] = c.value 
                    }
                    if(c.label.toLowerCase() == "expediting_dateReadyForInspectionExpected")
                    {
                        obj[c.label] = new Date(c.value );
                    }
                });
                return [obj];
            } else {
                return [];
            }
        },
        selectedRows() {
            if(this.table != null && this.table.selectedRows.length > 0) {
                return this.table.selectedRows;
            };
            return [];
        },
        isReleased() {
            return this.selectedRows.some((c) => {
                const col = c.columns.find((i) => { return i.label.toLowerCase() == 'inspection_isreleased'});
                return col.value;
            })
        },
        showAssignNfiBtn() {
            if(this.selectedRows.length == 0)
                return true;

            if(this.selectedRows.length >= 1 && !this.isReleased)
            {
                //const released = this.selectedRows.some((c) => { return c.columns.some((i) => { return i.label.toLowerCase() == 'inspection_isreleased' && i.value }) });
                //if(released)
                    //return false;
                
                const nfi = this.selectedRows.some((c) => { return c.columns.some((i) => { return i.label.toLowerCase() == 'inspection_nfino' && i.value > 0 }) });
                //let hasNfi = (this.selectedRows[0].cols.some((c) => { return c.propertyName.toLowerCase() == 'inspection_nfino' && c.text == null })) ? false : true;
                if(!nfi)
                    return true;
            }
            return false;
        },
        showClearNfiBtn() {
            if(!this.isReleased && this.selectedRows.length > 0 && this.roles.indexOf('Admin') >= 0)
            {
                return this.selectedRows.some((c) => {
                    const nfi = c.columns.find((i) => { return i.label.toLowerCase() == 'inspection_nfino'});
                    if(nfi.value > 0 && !!nfi.value)
                    {
                        return true;
                    }
                });
            };
            return false;
        },
        showReleaseBtn() {
            if(!this.isReleased && this.selectedRows.length > 0)
            {
                return this.selectedRows.some((c) => {
                    const nfi = c.columns.find((i) => { return i.label.toLowerCase() == 'inspection_nfino'});
                    if(nfi.value == 0 || !nfi.value)
                        return false;
                        
                    const date = c.columns.find((i) => { return i.label.toLowerCase() == 'inspection_datereleasedbyinspection'});
                    if(date.value != null)
                    {
                        const qty = c.columns.find((i) => { return i.label.toLowerCase() == 'inspection_releasedquantity'});
                        if(qty.value >= 0 || !qty.value)
                        {
                            return true;
                        }
                    }
                });
            };
            return false;
        },
        contextMenu() {
            let menu = [];
            
            if(this.table != null)
                menu.push({label: 'Refresh data', action: this.table.initLoad })

            if(!this.disableCreateNfiBtn)
                menu.push({ label: 'Assign NFI', action: this.createNFI })
            
            if(this.selectedRows.length > 0)
                menu.push({ label: 'Clear NFI', action: this.clearNFI })
            
            if(!this.disableSplitLineBtn)
                menu.push({ label: 'Split Line', action: () => { return document.querySelector("button[data-target='#splitInspectionModal']").click() } })
                        
            if(!this.disableSplitLineBtn)
                menu.push({ label: 'Certificates', action: () => { return document.querySelector("button[data-target='#inspectionCertificatesModal']").click() } })

            return menu;
        }
    },
    watch: {
        expeditingId(to)
        {
            if(to.length > 0)
            {
                let filters = to.map((c) => { return { property: "Inspection_ExpeditingId", value: c }});
                const filter = encodeURIComponent(JSON.stringify(filters));
                this.options.api = 'api/Tables/GetAsync/' + this.$route.params.projectId + '/inspection?filter=' + filter;
                if(!this.table)
                    this.table = this.$refs.table_inspection;
                this.table.initLoad();
            }
        }
    }
}
</script>
<style scoped>
.inline {
    display: inline-block;
}
.right {
    float: right;
}
.nfi {
    display: inline-block;
    vertical-align: middle;
}
.nfi input {
    width: 75px;
}
</style>