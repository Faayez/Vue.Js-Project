<template>
<div id="projectDashboard">
        <div class="row mb-3" v-if="project != null">
            <div class="col-md-6">
                <h3>Project : {{project.description}}</h3>
            </div>
            <div class="col-md-6 text-right">
                <button class="btn btn-leeuwen" data-target="#newProjectOrderModal" data-toggle="modal" @click="getDeliveryConditions">
                    <v-icon name="plus"></v-icon> New ProjectOrder
                </button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 margin-bottom">
                <card color="blue-header">
                    <template slot="card-header">Open Project Orders</template>
                    <template slot="card-body">
                        <table-grid id="open-orders-panel" :options="openOrderOptions"></table-grid>
                    </template>
                </card>
            </div>
            <div class="col-md-6 margin-bottom">
                <card color="blue-header">
                    <template slot="card-header">Late Project Orders</template>
                    <template slot="card-body">
                        <table-grid id="late-orders-panel" :options="lateOrderOptions"></table-grid>
                    </template>
                </card>
            </div>
            <div class="col-md-12 margin-bottom">
                <card  color="blue-header">
                    <template slot="card-header">Ready for shipping</template>
                    <template slot="card-body">
                        <table-grid id="shipping-orders-panel" :options="shippingOrderOptions"></table-grid>
                    </template>
                </card>
            </div>
        </div>
        
        <modal id="newProjectOrderModal" :save="addProjectOrder" isSmall="true">
            <template slot="title">New ProjectOrder</template>
            <template slot="body">
                <div class="form-group">
                    <label for="opcoCode" class="col-form-label">Customer Order No</label>
                    <input type="text" class="form-control" id="opcoCode" v-model="projectOrder.customerOrderNo">
                </div>
                <div class="form-group">
                    <label for="opcoName" class="col-form-label">Description</label>
                    <textarea type="text" class="form-control" id="opcoName" v-model="projectOrder.description"></textarea>
                </div>
                <div class="form-group">
                    <label for="opcoAddress" class="col-form-label">Delivery Contition</label>
                    <select type="text" class="form-control" id="opcoAddress" v-model="projectOrder.deliveryConditionId">
                        <option :key="del.id" v-for="del in deliveryConditions" :value="del.id">{{del.description}}</option>
                    </select>
                </div>
            </template>
        </modal>
</div>
</template>

<script>
import Modal from '@/components/Modal'
import Card from '@/components/Card'
import TableGrid from '@/components/TableGrid'
import { projectOrder } from '@/models/models.js';
export default {
    name: 'project-dashboard',
    components: {
        'modal': Modal,
        'card': Card,
        'table-grid': TableGrid
    },
    data() {
        return {
            projectOrder: new projectOrder({}),
            openOrderOptions: {
                id: 'open-orders-panel',
                api: 'api/Tables/GetOpenOrders/' + this.$route.params.projectId,
                take: 10,
                readonly: true,
                settings: false,
                selectable: false,
                hidden: []
            },
            lateOrderOptions: {
                id: 'late-orders-panel',
                api: 'api/Tables/GetLateOrders/' + this.$route.params.projectId,
                take: 10,
                readonly: true,
                settings: false,
                selectable: false,
                hidden: []
            },
            shippingOrderOptions: {
                id: 'shipping-orders-panel',
                api: 'api/Tables/GetOpenOrders/' + this.$route.params.projectId,
                take: 10,
                readonly: true,
                settings: false,
                selectable: false,
                hidden: []
            }
        }
    },
    mounted() {
    },
    methods: {
        getDeliveryConditions() {
            this.$store.dispatch('GET_DELIVERY_CONDITIONS');
        },
        addProjectOrder() {
            this.projectOrder.projectId = this.projectId;
            this.$http.post('api/projectOrders', this.projectOrder).then((res) => {
                this.projectOrder = new projectOrder({});
                document.getElementById('newProjectOrderModal').querySelector('button[data-dismiss=modal]').click();
                this.$refs.project_order_tab_1[0].$refs.table_project_orders.initLoad();
            });
        }
    },
    watch: {
    },
    computed: {
        project() {
            return this.$store.getters.project;
        },
        deliveryConditions() {
            return this.$store.getters.deliveryConditions;
        }
    }
}
</script>
<style scoped>
.margin-bottom {
    margin-bottom: 15px;
}
</style>