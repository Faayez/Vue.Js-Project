<template>
    <div>
        <div class="row mb-3">
            <div class="col-md-6">
                <h2>Projectorders</h2>
            </div>
            <div class="col-md-6 text-right">
                <button class="btn btn-outline-leeuwen" data-target="#newProjectOrder" data-toggle="modal">
                    <v-icon name="plus"></v-icon> Add ProjectOrder
                </button>
                <button class="btn btn-leeuwen" :disabled="selectedOrder == null" @click="removeProjectOrder">
                    <v-icon name="trash-alt"></v-icon>
                </button>
            </div>
        </div>
        <table-grid id="table_projectorders" ref="table_projectorders" :options="orderOptions"></table-grid>
        <hr>
        
        <div class="row"  v-show="selectOrder != null">
            <div class="col-md-6">
                <h3>Projectorderlines</h3>
            </div>
            <div class="col-md-6 text-right">
                <button class="btn btn-outline-leeuwen" data-target="#newProjectOrderLineModal" data-toggle="modal">
                    <v-icon name="plus"></v-icon> Add ProjectOrderLine
                </button>
                <button class="btn btn-leeuwen" @click="removeProjectOrderlines">
                    <v-icon name="trash-alt"></v-icon>
                </button>
            </div>
            <div class="col-md-12 mt-3">
                <table-grid id="table_projectorderlines" ref="table_projectorderlines" :options="lineOptions"></table-grid>
            </div>
        </div>


        <modal id="newProjectOrder" :save="addProjectOrder" :isSmall="true">
            <div slot="title">New Project Order</div>
            <div slot="body">
                <div class="form-group">
                    <label class="form-label">{{$t('ProjectOrder_CustomerOrderNo')}}</label>
                    <input class="form-control" v-model="projectOrder.customerOrderNo" type="text" />
                </div>
                <div class="form-group">
                    <label class="form-label">{{$t('ProjectOrder_Description')}}</label>
                    <textarea class="form-control" v-model="projectOrder.description" ></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">{{$t('ProjectOrder_DeliveryCondition')}}</label>
                    <input class="form-control" v-model="projectOrder.deliveryCondition" type="text" />
                    <!--<select class="form-control" v-model="projectOrder.deliveryConditionId">
                        <option v-for="del in deliveryConditions" :key="del.id" :value="del.id">{{del.description}}</option>
                    </select>-->
                </div>
            </div>
        </modal>
        <modal id="newProjectOrderLineModal" :save="addProjectOrderLine" v-if="selectedOrder != null">
            <div slot="title">New Project Orderline</div>
            <div slot="body">
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_CustomerCode')}}</label>
                            <input class="form-control" v-model="projectOrderLine.customerCode" type="text" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_UnitPrice')}}</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">{{currency}}</span>
                                </div>
                                <input class="form-control" v-model="projectOrderLine.unitPrice" type="number" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_Quantity')}}</label>
                            <input class="form-control" v-model="projectOrderLine.quantity" type="number" />
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="quantityUnit" id="quantityUnitMeters" value="PIECES" v-model="projectOrderLine.quantityUnit">
                            <label class="form-check-label" for="quantityUnitPieces">
                                Pieces
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="quantityUnit" id="quantityUnitMeters" value="SET" v-model="projectOrderLine.quantityUnit">
                            <label class="form-check-label" for="quantityUnitMeters">
                                Set
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="quantityUnit" id="quantityUnitMeters" value="METERS" v-model="projectOrderLine.quantityUnit">
                            <label class="form-check-label" for="quantityUnitMeters">
                                Meters
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="quantityUnit" id="quantityUnitFeet" value="FEET" v-model="projectOrderLine.quantityUnit">
                            <label class="form-check-label" for="quantityUnitFeet">
                                Feet
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_DeliveryDate')}}</label>
                            <date-input :date="projectOrderLine.deliveryDate" v-on:input="(value) => { projectOrderLine.deliveryDate = value }"></date-input>
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_Schedule')}}</label>
                            <input class="form-control" v-model="projectOrderLine.schedule"  />
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_Size')}}</label>
                            <input class="form-control" v-model="projectOrderLine.size"  />
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="type" id="typePipe" value="PIPE" v-model="projectOrderLine.type">
                            <label class="form-check-label" for="typePipe">
                                Pipes
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="type" id="typeComponent" value="COMPONENT" v-model="projectOrderLine.type">
                            <label class="form-check-label" for="typeComponent">
                                Components
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_Description')}}</label>
                            <textarea class="form-control" v-model="projectOrderLine.description"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_Remarks')}}</label>
                            <textarea class="form-control" v-model="projectOrderLine.remarks"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{$t('ProjectOrderLine_DeviationRemarks')}}</label>
                            <textarea class="form-control" v-model="projectOrderLine.deviationRemarks"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </modal>
    </div>
</template>
<script>
import Modal from '@/components/Modal';
import DateInput from '@/components/DateInput';
import TableGrid from '@/components/TableGrid';
import { projectOrder, projectOrderLine} from '@/models/models.js';
export default {
    name: 'projectorders',
    props: [],
    components: {
        'modal': Modal,
        'date-input': DateInput,
        'table-grid': TableGrid
    },
    data() {
        return {
            orderOptions: {
                api: 'api/Tables/GetAsync/' + this.$route.params.projectId + '/projectorders',
                saveApi: 'api/Tables/Save',
                take: 10,
                full: false,
                hidden: [],
                multiple: false,
                fixed: true,
                autoSave: true,
            },
            lineOptions: {
                api: null,
                saveApi: 'api/Tables/Save',
                take: 20,
                full: false,
                hidden: [],
                multiple: true,
                fixed: true,
                autoSave: true,
                select: []
            },
            selectedOrder: null,
            selectedOrderLines: [],
            orderTable: null,
            orderLineTable: null,
            projectOrder: new projectOrder({
                projectId: this.$route.params.projectId
            }),
            projectOrderLine: new projectOrderLine({
                quantityUnit: 'PIECES',
                type: 'PIPE'
            }),
            //deliveryConditions: []
        }
    },
    created() {
        if(!this.lineOptions.select.some((c) => { return c.id == "ProjectOrderLine_Type" }))
        {
            this.lineOptions.select.push(
            {
                id: "ProjectOrderLine_Type",
                values: this.$store.getters.ProjectOrderLine_Type
            });
        };
        if(!this.lineOptions.select.some((c) => { return c.id == "ProjectOrderLine_QuantityUnit" }))
        {
            this.lineOptions.select.push(
            {
                id: "ProjectOrderLine_QuantityUnit",
                values: this.$store.getters.ProjectOrderLine_QuantityUnit
            });
        };
    },
    mounted() {
        this.orderTable = this.$refs.table_projectorders;
        this.orderLineTable = this.$refs.table_projectorderlines;
    },
    methods: {
        addProjectOrder() {
            this.$http.post('api/ProjectOrders', this.projectOrder).then((res) => {
                this.projectOrder = new projectOrder({});
                this.$refs.table_projectorders.initLoad();
                document.querySelector("#newProjectOrder #closeBtn").click();
            });
        },
        removeProjectOrder() {
            if(confirm("Are you sure?")) {
                const order = this.selectOrder;
                const col = order.columns.find((c) => { return c.label.toLowerCase() == "projectorder_id"});
                this.$http.delete('api/ProjectOrders/' + col.value).then((res) => {
                    this.orderTable.rows.splice(this.orderTable.rows.indexOf(order), 1);
                });
            }
        },
        addProjectOrderLine() {
            const col = this.selectOrder.columns.find((c) => { return c.label.toLowerCase() == "projectorderline_id"});
            this.$http.post('api/ProjectOrderLines', col.value).then((res) => {
                this.projectOrderLine = new projectOrderLine({});
                this.$refs.table_projectorderlines.initLoad();
                document.querySelector("#newProjectOrderLineModal #closeBtn").click();
            });
        },
        removeProjectOrderlines() {
            if(confirm("Are you sure?")) {
                this.selectOrderlines.forEach((o) => {
                    const col = o.columns.find((c) => { return c.label.toLowerCase() == "projectorderline_id"});
                    this.$http.delete('api/ProjectOrderLines/' + col.value).then((res) => {
                        this.$refs.table_projectorderlines.rows.splice(this.orderLineTable.rows.indexOf(o), 1);
                    });
                })
                
            }
        },
        getDeliveryConditions() {
            return this.$http.get('api/DeliveryConditions').then((res) => {
                this.deliveryConditions = res.data;
            });
        },
    },
    computed: {
        currency() {
            return this.$store.getters.project.currency;
        },
        selectOrder() {
            this.selectedOrder = null;
            if(this.orderTable != null && this.orderTable.selectedRows.length > 0) {
                this.selectedOrder = this.orderTable.selectedRows[0];
            };
            return this.selectedOrder;
        },
        selectOrderlines() {
            this.selectedOrderLines = null;
            if(this.orderLineTable != null && this.orderLineTable.selectedRows.length > 0) {
                this.selectedOrderLines = this.orderLineTable.selectedRows;
            };
            return this.selectedOrderLines;
        }
    },
    watch: {
        selectedOrder(to, from){
            if(to != null) {
                const col = to.columns.find((c) => { return c.label.toLowerCase() == "projectorder_id" });
                const filter = encodeURIComponent(JSON.stringify([{property:"ProjectOrderLine_ProjectOrderId",value: col.value }]));
                this.lineOptions.api = 'api/Tables//GetAsync/' + this.$route.params.projectId + '/projectorderlines?filter=' + filter;
                //this.lineOptions.api = 'api/Tables/GetProjectOrderLines/' + col.value;
                this.$refs.table_projectorderlines.initLoad();
            }
        }
    }
}
</script>
<style scoped>
</style>
