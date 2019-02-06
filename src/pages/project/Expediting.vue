<template>
    <div id="expediting">
        <h2>Expediting</h2>
        <div class="row form-group mt-3">
            <div class="col-md-6">
                <button class="btn btn-outline-leeuwen" data-target="#splitExpeditingModal" data-toggle="modal" :disabled="disableSplitLineBtn">Split Line</button>
                <checkbox :check="esr" label="ESR Report" class="inline" @toggle="showESR"></checkbox>
            </div>
            <div class="col-md-6">
                <update-all :table="table"></update-all>
            </div> 
        </div>
        <table-grid id="table_expediting" ref="table_expediting" :options="options" :contextMenu="contextMenu"></table-grid>
        <split-line-modal :data="projectOrderLine" v-if="!disableSplitLineBtn" v-on:reload="reload"></split-line-modal>
    </div>
</template>
<script>
import TableGrid from '@/components/TableGrid';
import SplitLineModal from '@/pages/project/modals/SplitLineExpediting';
import UpdateAll from '@/components/UpdateAll';
import CheckBox from '@/components/CheckBox';
export default {
    name: 'expediting',
    props: [],
    components: {
        'table-grid': TableGrid,
        'split-line-modal': SplitLineModal,
        'update-all': UpdateAll,
        'checkbox': CheckBox
    },
    data () {
        return {
            options: {
                api: 'api/Tables/GetAsync/' + this.$route.params.projectId + '/expediting',
                saveApi: 'api/Tables/Save',
                downloadApi: 'api/Tables/Download/' + this.$route.params.projectId + '/expediting/',
                take: 25,
                full: true,
                hidden: ["id", "projectOrderLineId", "isReleasedForInspection"],
                multiple: true,
                fixed: true,
                autoSave: true,
                bulkupload: true,
                select: []
            },
            table: null,
            esr: false
        }
    },
    created() {
        if(!this.options.select.some((c) => { return c.id == "ProjectOrderLine_Type" }))
        {
            this.options.select.push(
            {
                id: "ProjectOrderLine_Type",
                values: this.$store.getters.ProjectOrderLine_Type
            });
        };
        if(!this.options.select.some((c) => { return c.id == "ProjectOrderLine_QuantityUnit" }))
        {
            this.options.select.push(
            {
                id: "ProjectOrderLine_QuantityUnit",
                values: this.$store.getters.ProjectOrderLine_QuantityUnit
            });
        };
    },
    mounted() {
        this.table = this.$refs.table_expediting;
    },
    methods: {
        getDuf() {
            this.$http.get('api/Duf/' + this.projectId, { responseType: 'blob' }).then((res) => {
                var blob = new Blob([res.data], { type: res.headers.get('content-type') });

                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);

                var disposition = res.headers.get('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) { 
                        link.download = matches[1].replace(/['"]/g, '');
                    }
                }

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);
            });
        },
        reload() {
            this.table.load().then((res) => {
                this.table.loadRows(res.data.data);
            })
        },
        showESR(obj, prop, check)
        {
            this.esr = check;
            if(check)
            {
                this.options.api = 'api/Tables/GetAsync/' + this.$route.params.projectId + '/esr';
            } else {
                this.options.api = 'api/Tables/GetAsync/' + this.$route.params.projectId + '/expediting';
            }
            this.table.initLoad();
        }
        /*
        skipInspection() {
            const rows = this.selectedRows.filter((r) => { return r.cols.some((c) => { return c.label.toLowerCase() == "expediting_isreleasedforinspection" && c.text == false }) });
            rows.forEach((row) => {
                let col = row.columns.find((c) => { return c.label.toLowerCase() == "expediting_id" });

                this.$http.post('api/Expeditings/SkipInspection/' + col.text).then((res) => 
                {
                    row.cols.forEach((c) => { 
                        c.edit = false; 
                        if(c.label.toLowerCase() == "expediting_isreleasedforinspection") 
                        {
                            c.text = true;
                        }
                    });
                    this.reload();
                });
            });
        },
        */
    },
    computed: {
        projectId() {
            return this.$route.params.projectId;
        },
        /*
        disabledSkipBtns() {
            if(this.table != null) {
                return (this.selectedRows.some((r) => { return r.columns.some((c) => { return c.label.toLowerCase() == "expediting_isreleasedforinspection" && c.value == false }) })) ? false : true;
            };
            return true;
        },
        */
        disableSplitLineBtn() {
            if(this.table != null) {
                if(this.selectedRows.some((r) => { 
                    return r.columns.some((c) => { 
                        return c.label.toLowerCase() == "inspection_isreleased" && c.value == false
                    });
                }) && this.selectedRows.length === 1) 
                {
                    return false;
                }
            };
            return true;  
        },
        selectedRows() {
            if(this.table != null && this.table.selectedRows.length > 0) {
                return this.table.selectedRows;
            };
            return [];
        },
        projectOrderLine() {
            if(this.selectedRows.length === 1) {
                let obj = {};
                this.selectedRows[0].columns.forEach((c) => 
                {
                    if(
                        c.label.toLowerCase() == "expediting_id"
                        || c.label.toLowerCase() == "projectorderline_id"
                        || c.label.toLowerCase() == "projectorder_customerorderno"
                        || c.label.toLowerCase() == "projectorderline_customercode"
                        || c.label.toLowerCase() == "projectorderline_rev"
                        || c.label.toLowerCase() == "projectorderline_quantity"
                        || c.label.toLowerCase() == "projectorderline_quantityunit"
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
                                   
            if(!this.disableSplitLineBtn)
                menu.push({ label: 'Split Line', action: () => { return document.querySelector("button[data-target='#splitExpeditingModal']").click() } })
                        
            return menu;
        }
    }
}
</script>
<style scoped>
.inline{
    display: inline-block;
}
</style>