<template>
    <modal id="splitInspectionModal" :save="saveChanges">
        <template slot="title">Split Inspection Line</template>
        <template slot="body">
            <table-comp :data="data"></table-comp>
            <hr>
            <div class="table-responsive">
                <h3>Inspections</h3>
                <table class="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th>{{$t('Line')}}</th>
                            <th>{{$t('Inspection_Quantity')}}</th>
                            <th>{{$t('Inspection_DateInspectionActual')}}</th>
                            <th>{{$t('Inspection_DateReleasedByInspection')}}</th>
                            <th>{{$t('Inspection_Manufacturer')}}</th>
                            <th>{{$t('Inspection_CountryOfOrigin')}}</th>
                            <th>{{$t('Inspection_HeatNo')}}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr :key="index" v-for="(insp, index) in inspections" :class="{ 'table-warning': insp.isDirty }">
                            <td>{{index + 1}}</td>
                            <td>
                                <input type="number" class="form-control-plaintext form-control-sm" v-model="insp.quantity" @change="changeQuantity(insp)" />
                            </td>
                            <td @click="toggleEdit(insp, $event)">
                                <span v-if="!insp.isEditing">{{ $d(new Date(insp.dateInspectionActual), 'short') }}</span>
                                <div class="input-group input-group-sm" v-else >
                                    <input type="date" class="form-control-plaintext form-control-sm" v-model="insp.dateInspectionActual" />
                                </div>
                            </td>
                            <td @click="toggleEdit(insp, $event)">
                                <span v-if="!insp.isEditing" >{{ $d(new Date(insp.dateReleasedByInspection), 'short') }}</span>
                                <div class="input-group input-group-sm" v-else >
                                    <input type="date" class="form-control-plaintext form-control-sm" v-model="insp.dateReleasedByInspection" />
                                </div>
                            </td>
                            <td>
                                <input type="text" class="form-control-plaintext form-control-sm" v-model="insp.manufacturer" @change="insp.isDirty = true" >
                            </td>
                            <td>
                                <input type="text" class="form-control-plaintext form-control-sm" v-model="insp.countryOfOrigin" @change="insp.isDirty = true" >
                            </td>
                            <td>
                                <input type="text" class="form-control-plaintext form-control-sm" v-model="insp.heatNo" @change="insp.isDirty = true" >
                            </td>
                            <td class="text-center">
                                <div class="btn-group">
                                    <button class="btn btn-leeuwen-blue btn-sm" @click="duplicateInspection(insp)">
                                        <v-icon name="clone"></v-icon>
                                    </button>
                                    <button class="btn btn-leeuwen btn-sm" @click="removeInspection(insp)">
                                        <v-icon name="trash-alt"></v-icon>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th class="text-right">Sum:</th>
                            <th colspan="7">{{sumOfQuantity}} of {{maxQuantity}}</th>
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
import { inspection } from '@/models/models.js';
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
                take: 1,
                hidden: [],
                fixed: false,
                autoSave: false,
                settings: false
            },
            inspections: [],
            isEditing: false
        }
    },
    mounted() {
        let api = 'api/Inspections/GetInspectionsByExpeditingId/' + this.expeditingId;
        this.$http.get(api).then((res) => { 
            this.inspections = res.data.map((d) => { 
                let insp = new inspection (d);
                insp.orgQuantity = insp.quantity;
                return insp;
            });
        });
    },
    methods: {
        toggleEdit(insp, ev) {
            let target = ev.currentTarget;
            if(target.tagName.toUpperCase() === 'TD') 
            {
                insp.isEditing = true;
                setTimeout(() => {
                    target.querySelector('input').focus();
                    target.querySelector('input').onfocusout = () => { 
                        insp.isDirty = true;
                        insp.isEditing = false;
                    };
                }, 1);
            }
        },
        duplicateInspection(insp) {
            var copy = Object.assign({}, insp);
            copy.quantity = (this.maxQuantity - this.sumOfQuantity) > 0 ? this.maxQuantity - this.sumOfQuantity : 0;
            copy.orgQuantity = (this.maxQuantity - this.sumOfQuantity) > 0 ? this.maxQuantity - this.sumOfQuantity : 0;
            copy.link = insp.id;
            copy.id = 0;
            copy.isDirty = true;
            this.inspections.push(copy);
        },
        removeInspection(insp) {
            if(insp.id > 0) {
                let api = 'api/Inspections/' + insp.id;
                this.$http.delete(api).then((res) => {
                    this.inspections.splice(this.inspections.indexOf(insp), 1);
                });
            } else {
                this.inspections.splice(this.inspections.indexOf(insp), 1);
            }
        },
        changeQuantity(insp) {
            insp.isDirty = true;
            if(insp.link != null) 
            {
                let linked = this.inspections.filter((e) => { return e.id == insp.link})[0];
                let sum = parseInt(linked.quantity) + insp.orgQuantity;

                if(sum - parseInt(insp.quantity) < 0) 
                {
                    return insp.quantity = orgQuantity;
                };

                linked.quantity = sum - parseInt(insp.quantity);
                linked.isDirty = true;
                insp.orgQuantity = parseInt(insp.quantity);
            }
        },
        makeDirty(insp, date) {
            insp.isDirty = true;
        },
        addInspections() 
        {
            return new Promise((resolve, reject) => {
                let count = this.inspections.filter((c) => { return c.isDirty && c.link != null }).length;
                if(count == 0)
                    resolve();
                    
                this.inspections.filter((c) => { return c.isDirty && c.link != null}).forEach((e) => {
                    return this.$http.post('api/Inspections/', e).then((res) => {
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
        updateInspections()
        {
            return new Promise((resolve, reject) => {
                let count = this.inspections.filter((c) => { return c.isDirty && c.link == null }).length;
                if(count == 0)
                    resolve();

                this.inspections.filter((c) => { return c.isDirty && c.link == null}).forEach((e) => {
                    return this.$http.put('api/Inspections/' + e.id, e).then((res) => {
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
                    this.updateInspections().then(() =>
                    {
                        this.addInspections().then(() => {
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
                    resolve(true);
                    alert("Please match the sum of the quantities with the total.");
                }
            });
        }
    },
    computed: {
        expeditingId() {
            return this.data[0].Expediting_Id
        },
        isValid() {
            if(this.sumOfQuantity == this.maxQuantity)
                return true;
            return false;
        },
        sumOfQuantity() {
            let qty = 0;
            this.inspections.forEach((e) => { return qty += parseInt(e.quantity) });
            return qty;
        },
        maxQuantity() {
            return parseInt(this.data[0].Expediting_Quantity);
        }
    }
}
</script>

<style scoped>
</style>