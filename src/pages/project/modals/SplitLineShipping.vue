<template>
    <modal id="splitShippingModal" :save="saveChanges">
        <template slot="title">Split Shipping Line</template>
        <template slot="body">
            <table-comp :data="data"></table-comp>
            <hr>
            <div class="table-responsive">
                <div class="row mb-3">
                    <div class="col-md-12">
                        <h3>Split Lines</h3>
                    </div>
                </div>
                <table class="table table-bordered table-sm">
                    <thead>
                        <tr >
                            <th v-for="(value, prop) in data[0]" :key="prop">{{$t(prop)}}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody class="text-center">
                        <tr :key="ship.id" v-for="ship in packages">
                            <td v-for="(value, prop) in ship" :key="prop">
                                <input type="number" class="form-control-plaintext form-control-sm text-center" v-if="prop == 'Shipping_Quantity'" v-model="ship[prop]" />
                                <input type="text" class="form-control-plaintext form-control-sm text-center" v-else-if="prop == 'Shipping_Comments'" v-model="ship[prop]" />
                                <span v-else>{{value}}</span>
                            </td>
                            <td class="text-center">
                                <div class="btn-group">
                                    <button class="btn btn-leeuwen-blue btn-sm" @click="duplicateShipping(ship)" :disabled="disableCloneBtn">
                                        <v-icon name="clone"></v-icon>
                                    </button>
                                    <button class="btn btn-leeuwen btn-sm" @click="removeShipping(ship)">
                                        <v-icon name="trash-alt"></v-icon>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th class="text-right" colspan="1">Sum:</th>
                            <th :colspan="Object.keys(data[0]).length">{{sumOfQuantity}} of {{maxQuantity}}</th>
                        </tr>
                    </tfoot>
                </table>

                <div class="alert alert-warning" role="alert" v-if="!isValid">
                    The sum of the quantities does not match the total or you have a duplicate package number.
                </div>
            </div>
        </template>
    </modal>
</template>

<script>

import Modal from '@/components/Modal';
import DateInput from '@/components/DateInput';
import Table from '@/components/Table';
import { shipping } from '@/models/models.js';
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
            packages: [],
            isEditing: false,
            shippingPackageTypes: [],
            filename: "Choose file..."
        }
    },
    mounted() {  
        let copy = Object.assign({}, this.data[0]);
        this.packages.push(copy);   
    },
    methods: {
        duplicateShipping(ship) {
            var copy = Object.assign({}, ship);
            copy.Shipping_Id = 0;
            copy.Shipping_Quantity = 0;
            copy.Shipping_Comments = null;
            this.packages.push(copy);
        },
        removeShipping(ship) {
            if(ship.id > 0) {
                let api = 'api/Shippings/' + ship.id;
                this.$http.delete(api).then((res) => {
                    this.packages.splice(this.packages.indexOf(ship), 1);
                });
            } else {
                this.packages.splice(this.packages.indexOf(ship), 1);
            }
        },
        updateShippings()
        {
            return new Promise((resolve, reject) => {
                const packages = this.packages.filter((c) => { return c.Shipping_Id > 0 && c.Shipping_Quantity > 0 });
                let count = packages.length;

                packages.forEach((c) => {
                    //put
                    let s = new shipping({
                        id: c.Shipping_Id,
                        quantity: c.Shipping_Quantity,
                        comments: c.Shipping_Comments
                    });
                    this.$http.put('api/Shippings/' + s.id, s).then((res) => {
                        count--;
                        if(count == 0)
                            resolve();
                    }).catch((err) => {
                        count--;
                        if(count == 0)
                            resolve();
                        console.log(err);
                    })
                });

            });
        },
        addShippings() {
            return new Promise((resolve, reject) => {
                const packages = this.packages.filter((c) => { return c.Shipping_Id == 0 && c.Shipping_Quantity > 0 });
                let count = packages.length;

                packages.forEach((c) => {
                    let s = new shipping({
                        quantity: c.Shipping_Quantity,
                        comments: c.Shipping_Comments
                    });
                    this.$http.post('api/Shippings/Clone/' + this.data[0].Shipping_Id, s).then((res) => {
                        count--;
                        if(count == 0)
                            resolve();
                    }).catch((err) => {
                        count--;
                        if(count == 0)
                            resolve();
                        console.log(err);
                    })
                });

            });
        },
        saveChanges() {
            return new Promise((resolve, reject) => {
                if(this.isValid) 
                {
                    this.updateShippings().then((res) => {
                        this.addShippings().then((res) => {
                            resolve(true);
                            this.$emit('reload');
                        }).catch((err) =>
                        {
                            reject(err);
                        })
                    }).catch((err) =>
                    {
                            reject(err);
                    });
                } else {
                    resolve(true);
                    alert("Please match the sum of the quantities with the total.");
                }
            });
        }
    },
    computed: {
        shippingId() {
            return this.data[0].Shipping_Id;
        },
        isValid() {
            return (this.sumOfQuantity == this.maxQuantity);
        },
        sumOfQuantity() {
            return this.packages.map((c) => { return c.Shipping_Quantity }).reduce((a,b) => parseInt(a) + parseInt(b), 0);
        },
        maxQuantity() {
            const col = this.data[0].Shipping_Quantity;
            return parseInt(col);
        },
        disableCloneBtn() {
            const col = this.data[0].Shipping_PackingListNo;
            if(!!col && col.value > 0)
                return true;
            
            return false;  
        },
    }
}
</script>

<style scoped>
</style>