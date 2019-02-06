<template>
    <modal id="splitExpeditingModal" :save="saveChanges">
        <template slot="title">Split Expediting Line</template>
        <template slot="body">
            <table-comp :data="data"></table-comp>
            <!--<table-grid id="project_order_split_line" ref="project_order_split_line" :options="options" :data="data" v-if="data.length > 0"></table-grid>-->
            
            <hr>
            <div class="table-responsive">
                <h3>Expeditings</h3>
                <table class="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th>{{$t('Expediting_Id')}}</th>
                            <th>{{$t('Expediting_Quantity')}}</th>
                            <th>{{$t('Expediting_DateDeliveryExpected')}}</th>
                            <th>{{$t('Expediting_DateDeliveryActual')}}</th>
                            <th>{{$t('Expediting_DateRfiExpected')}}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr :key="exp.id" v-for="exp in expeditings" :class="{ 'table-warning': exp.isDirty }">
                            <td>{{exp.id}}</td>
                            <td>
                                <input type="number" class="form-control-plaintext form-control-sm" v-model="exp.quantity" @change="changeQuantity(exp)" />
                            </td>
                            <td @click="toggleEdit(exp, $event)">
                                <span v-if="!exp.isEditing" >{{ $d(new Date(exp.dateDeliveryExpected), 'short') }}</span>
                                <div class="input-group input-group-sm" v-else >
                                    <input type="date" class="form-control-plaintext form-control-sm" v-model="exp.dateDeliveryExpected" />
                                </div>
                            </td>
                            <td @click="toggleEdit(exp, $event)">
                                <span v-if="!exp.isEditing" >{{ $d(new Date(exp.dateDeliveryActual), 'short') }}</span>
                                <div class="input-group input-group-sm" v-else >
                                    <input type="date" class="form-control-plaintext form-control-sm" v-model="exp.dateDeliveryActual" />
                                </div>
                            </td>
                            <td @click="toggleEdit(exp, $event)">
                                <span v-if="!exp.isEditing" >{{ $d(new Date(exp.dateReadyForInspectionExpected), 'short') }}</span>
                                <div class="input-group input-group-sm" v-else >
                                    <input type="date" class="form-control-plaintext form-control-sm" v-model="exp.dateReadyForInspectionExpected" />
                                </div>
                            </td>
                            <td class="text-center">
                                <div class="btn-group">
                                    <button class="btn btn-leeuwen-blue btn-sm" @click="duplicateExpediting(exp)">
                                        <v-icon name="clone"></v-icon>
                                    </button>
                                    <button class="btn btn-leeuwen btn-sm" @click="removeExpediting(exp)">
                                        <v-icon name="trash-alt"></v-icon>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th class="text-right">Sum:</th>
                            <th colspan="5">{{sumOfQuantity}} of {{maxQuantity}}</th>
                        </tr>
                    </tfoot>
                </table>

                <div class="alert alert-warning" role="alert" v-if="!isValid">
                    The sum of the quantities does not match the total.
                </div>
            </div>
        </template>
    </modal>
</template>

<script>

import Modal from '@/components/Modal';
import DateInput from '@/components/DateInput';
import Table from '@/components/Table';
import { expediting } from '@/models/models.js';
export default {
    props: ['data'],
    components: {
        'modal': Modal,
        'date-input': DateInput,
        'table-comp': Table
    },
    data() {
        return {
            options: {
                take: 3,
                hidden: [],
                fixed: false,
                autoSave: false,
                settings: false
            },
            expeditings: []
        }
    },
    mounted() {
        let api = 'api/Expeditings/GetExpeditingsByOrderLineId/' + this.projectOrderLineId;
        this.$http.get(api).then((res) => { 
            this.expeditings = res.data.map((d) => {  
                let exp = new expediting (d);
                exp.orgQuantity = exp.quantity;
                return exp;
            });
            
        });
    },
    methods: {
        toggleEdit(exp, ev) {
            let target = ev.currentTarget;
            if(target.tagName.toUpperCase() === 'TD') 
            {
                exp.isEditing = true;
                setTimeout(() => {
                    target.querySelector('input').focus();
                    target.querySelector('input').onfocusout = () => { 
                        exp.isDirty = true;
                        exp.isEditing = false;
                    };
                }, 1);
            }
        },
        duplicateExpediting(exp) {
            var copy = Object.assign({}, exp);
            copy.quantity = (this.maxQuantity - this.sumOfQuantity) > 0 ? this.maxQuantity - this.sumOfQuantity : 0;
            copy.orgQuantity = (this.maxQuantity - this.sumOfQuantity) > 0 ? this.maxQuantity - this.sumOfQuantity : 0;
            copy.link = exp.id;
            copy.id = 0;
            copy.isDirty = true;
            this.expeditings.push(copy);
        },
        removeExpediting(exp) {
            if(exp.id > 0) {
                let api = 'api/Expeditings/' + exp.id;
                this.$http.delete(api).then((res) => {
                    this.expeditings.splice(this.expeditings.indexOf(exp), 1);
                });
            } else {
                this.expeditings.splice(this.expeditings.indexOf(exp), 1);
            }
        },
        changeQuantity(exp) {
            exp.isDirty = true;
            if(exp.link != null) 
            {
                let linked = this.expeditings.filter((e) => { return e.id == exp.link})[0];
                let sum = parseInt(linked.quantity) + exp.orgQuantity;

                if(sum - parseInt(exp.quantity) < 0) 
                {
                    return exp.quantity = orgQuantity;
                };

                linked.quantity = sum - parseInt(exp.quantity);
                linked.isDirty = true;
                exp.orgQuantity = parseInt(exp.quantity);
            }
        },
        changeDate(exp, date) {
            exp.isDirty = true;
            if(date == "Invalid date")
                date = null;
        },
        addExpeditings() 
        {
            return new Promise((resolve, reject) => {
                let count = this.expeditings.filter((c) => { return c.isDirty && c.link != null }).length;
                this.expeditings.filter((c) => { return c.isDirty && c.link != null}).forEach((e) => {
                    return this.$http.post('api/Expeditings/', e).then((res) => {
                        count--;
                        e.isDirty = false;
                        if(count == 0) 
                        {
                            resolve();
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                });
            });
        },
        updateExpeditings()
        {
            return new Promise((resolve, reject) => {
                let count = this.expeditings.filter((c) => { return c.isDirty && c.link == null }).length;
                this.expeditings.filter((c) => { return c.isDirty && c.link == null}).forEach((e) => {
                    return this.$http.put('api/Expeditings/' + e.id, e).then((res) => {
                        count--;
                        e.isDirty = false;
                        if(count == 0) 
                        {
                            resolve();
                        }
                    }).catch((err) => {
                        reject(err);
                    })
                });
            });
        },
        saveChanges() {
            return new Promise((resolve, reject) => {
                if(this.isValid) 
                {
                    let dirty = [];
                    this.updateExpeditings().then(() =>
                    {
                        this.addExpeditings().then(() => {
                            resolve(true);
                            this.$emit('reload');
                        }).catch((err) =>
                        {
                                reject(err);
                        })
                    }).catch((err) =>
                    {
                            reject(err);
                    })

                } else {
                    alert("Please match the sum of the quantities with the total.");
                }
            });
        }
    },
    computed: {
        projectOrderLineId() {
            return this.data[0].ProjectOrderLine_Id
        },
        isValid() {
            if(this.sumOfQuantity == this.maxQuantity)
                return true;
            return false;
        },
        sumOfQuantity() {
            let qty = 0;
            this.expeditings.forEach((e) => { return qty += parseInt(e.quantity) });
            return qty;
        },
        maxQuantity() {
            return parseInt(this.data[0].ProjectOrderLine_Quantity);
        }
    }
}
</script>

<style scoped>
</style>