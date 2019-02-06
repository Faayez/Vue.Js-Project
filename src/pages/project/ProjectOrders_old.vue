<template>
    <layout id="projectOrders">
        <template slot="content">
            <table-grid id="project-orders" :options="projectOrderOptions" :onSelect="onSelect" ref="table_project_orders"></table-grid>
            <card v-if="projectOrder != null" color='blue-header'>
                <div slot="card-header">
                    <div class="row">
                        <div class="col-md-6">
                            {{projectOrder.id}} - {{projectOrder.customerOrderNo}}
                        </div>
                        <div class="col-md-6 text-right" v-if="projectOrder.isDirty">
                            <button class="btn btn-success btn-sm" @click="saveProjectOrder">
                                <v-icon name="save"></v-icon>
                            </button>
                        </div>
                    </div>
                </div>
                <div slot="card-body">
                    <carousel :perPage="1" :navigationEnabled="false" :paginationEnabled="false" ref="carousel">
                        <slide>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Customer OrderNo</label>
                                        <input class="form-control" v-model="projectOrder.customerOrderNo" @change="projectOrder.isDirty = true" />
                                    </div>
                                    <div class="form-group">
                                        <label>Revision</label>
                                        <input class="form-control" type="number" v-model="projectOrder.rev" @change="projectOrder.isDirty = true" />
                                    </div>
                                    <div class="form-group">
                                        <label>DeliveryCondition</label>
                                        <select class="form-control" v-model="projectOrder.deliveryConditionId" @change="projectOrder.isDirty = true">
                                            <option :key="del.id" v-for="del in deliveryConditions" :value="del.id">{{del.description}}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Description</label>
                                        <textarea class="form-control" v-model="projectOrder.description" rows="8" @change="projectOrder.isDirty = true"></textarea>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h3>Projectorder Lines</h3>
                                </div>
                                <div class="col-md-6 text-right">
                                    <button class="btn btn-leeuwen" data-target="#newProjectOrderLineModal" data-toggle="modal" @click="getArticles">
                                        <v-icon name="plus"></v-icon> New Project Orderline
                                    </button>
                                    <button class="btn btn-outline-leeuwen-blue">
                                        <v-icon name="upload"></v-icon> Upload DUF
                                    </button>
                                    <button class="btn btn-outline-leeuwen-blue">
                                        <v-icon name="download"></v-icon> Download DUF
                                    </button>
                                </div>
                            </div>
                            <table-grid id="project-line-orders" :options="projectOrderLineOptions" :onSelect="onSelectProductLine" ref="table_project_line_orders"></table-grid>
                        </slide>
                        <slide>
                            <project-order-lines :projectOrderLineId="selectedProductOrderLineId"></project-order-lines>
                        </slide>
                    </carousel>
                </div>
            </card>
            <modal id="newProjectOrderLineModal" :save="addOrderLine">
                <div slot="title">New Project Orderline</div>
                <div slot="body">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group ">
                                <label class="form-label">Article</label>
                                <div class="input-group">
                                    <select class="form-control" v-model="projectOrderLine.articleId">
                                        <option :key="art.id" :value="art.id" v-for="art in articles">{{art.description}}</option>
                                    </select>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-leeuwen-blue" type="button" @click="goToArticlePage">
                                            <v-icon name="plus"></v-icon>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Unit Price</label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">€</span>
                                    </div>
                                    <input class="form-control" v-model="projectOrderLine.unitPrice" type="number" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Total Quantity</label>
                                <input class="form-control" v-model="projectOrderLine.quantity" type="number" />
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="quantityUnit" id="quantityUnitMeters" value="Meters" v-model="projectOrderLine.quantityUnit">
                                <label class="form-check-label" for="quantityUnitMeters">
                                    Meters
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="quantityUnit" id="quantityUnitFeet" value="Feet" v-model="projectOrderLine.quantityUnit">
                                <label class="form-check-label" for="quantityUnitFeet">
                                    Feet
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="quantityUnit" id="quantityUnitMeters" value="Pieces" v-model="projectOrderLine.quantityUnit">
                                <label class="form-check-label" for="quantityUnitPieces">
                                    Pieces
                                </label>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label class="form-label">Contract Delivery Date</label>
                                <date-input :date="projectOrderLine.deliveryDate" v-on:input="(value) => { projectOrderLine.deliveryDate = value }"></date-input>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Schedule</label>
                                <input class="form-control" v-model="projectOrderLine.schedule"  />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Size</label>
                                <input class="form-control" v-model="projectOrderLine.size"  />
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="projectOrderLine.description"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Remarks</label>
                                <textarea class="form-control" v-model="projectOrderLine.remarks"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Deviation Remarks</label>
                                <textarea class="form-control" v-model="projectOrderLine.deviationRemarks"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </modal>
        </template>
    </layout>
</template>
<script>
import Layout from '@/pages/project/_Layout'
import Card from '@/components/Card'
import DateInput from '@/components/DateInput';
import TableGrid from '@/components/TableGrid'
import Modal from '@/components/Modal'
//import ProjectOrderLines from '@/pages/project/Tabs/ProjectOrderLines'
import { projectOrderLine } from '@/models'
import { Carousel, Slide } from 'vue-carousel';
import { setTimeout } from 'timers';

export default {
    name: 'project-orders',
    components: {
        'layout': Layout,
        'card': Card,
        'date-input': DateInput,
        'table-grid': TableGrid,
        'modal': Modal,
        'carousel': Carousel,
        'slide': Slide,
        //'project-order-lines': ProjectOrderLines
    },
    data () {
        return {
            selectedRow: null,
            projectOrder: null,
            articles: [],
            deliveryConditions: [],
            isSaveIsPending: false,
            projectOrderLine: new projectOrderLine({}),
            selectedProductOrderLineId: null,
            projectOrderOptions: {
                id: 'project-orders',
                api: 'api/Tables/GetProjectOrders/' + this.$route.params.projectId,
                saveApi: 'api/ProjectOrders',
                deleteApi: 'api/ProjectOrders',
                readonly: true,
                take: 5,
                hidden: ['id','projectId']
            },
            projectOrderLineOptions: {
                id: 'project-order-lines',
                api: 'api/Tables/GetProjectOrderLines/' + this.projectOrderId,
                readonly: true,
                take: 10,
                hidden: ['id']
            }
        }
    },
    methods: {
        goToArticlePage() {
            document.getElementById('newProjectOrderLineModal').querySelector('button[data-dismiss=modal]').click();
            this.$router.push({ name: 'Articles' });
        },
        onSelect(row) {
            this.selectedRow = null;
            this.projectOrder = null;

            if(row.selected) {
                if(this.deliveryConditions.length == 0)
                    this.getDeliveryConditions();

                this.selectedRow = row;
                this.getProjectOrder();
                this.$parent.selectedProjectOrderLine = null;
                this.projectOrderLineOptions.api = 'api/Tables/GetProjectOrderLines/' + this.projectOrderId;
            } 
            else 
            {
                this.$parent.selectedProjectOrderLine = null;
                this.selectedRow = null;
                this.projectOrder = null;
            }
        },
        onSelectProductLine(row) {
            this.selectedProductOrderLineId = null;
            if(row.selected) {     
                this.selectedProductOrderLineId = row.id;     
                this.$refs.carousel.goToPage(1);
            } 
            else 
            {
                this.$refs.carousel.goToPage(0);
                this.selectedProductOrderLineId = null;
            }
        },
        addOrderLine() {
            this.projectOrderLine.projectOrderId = this.projectOrderId;
            this.$http.post('api/ProjectOrderLines', this.projectOrderLine).then((res) => {
                this.projectOrderLine = new projectOrderLine({});
                document.getElementById('newProjectOrderLineModal').querySelector('button[data-dismiss=modal]').click();
                this.$refs.table_project_line_orders.initLoad();
            });
        },
        getProjectOrder() {
            return this.$http.get('api/ProjectOrders/' + this.projectOrderId).then((res) => {
                res.data.isDirty = false;
                this.projectOrder = res.data;
            });
        },
        getArticles() {
            if(this.articles.length == 0) {
                return this.$http.get('api/Articles').then((res) => {    
                    this.articles = res.data;
                });
            };
        },
        getDeliveryConditions() {
            return this.$http.get('api/DeliveryConditions').then((res) => {
                this.deliveryConditions = res.data;
            });
        },
        pendingSave() {
            if(!this.isSaveIsPending) {
                let self = this;
                setTimeout(() => {
                    if(self.isSaveIsPending && self.projectOrder.isDirty) {
                        self.saveProjectOrder();
                    }
                }, 5000);
            }
            this.isSaveIsPending = true;
        },
        saveProjectOrder() {
            this.$http.put('api/ProjectOrders/' + this.projectOrderId, this.projectOrder).then((res) => {
                this.projectOrder.isDirty = false;
                this.isSaveIsPending = false;
            });
        }
    },
    watch: {
    },
    computed: {
        projectOrderId () {
            return (this.selectedRow == null) ? null : this.selectedRow.id;
        },
        projectOrderCustomerNo() {
            return (this.selectedRow == null) ? null : this.selectedRow.customerOrderNo;
        },
        projectOrderDescription() {
            return (this.selectedRow == null) ? null : this.selectedRow.description;
        }
    }
}
</script>
<style scoped>
.VueCarousel-slide {
    max-width: 100%;
}
</style>