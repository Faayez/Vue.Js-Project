<template>
    <modal id="packageShippingModal" :save="saveChanges"  :showFooter="true">
        <template slot="title">Add New Package</template>
        <template slot="body">
            <div class="table-responsive">
                <table class="table table-bordered table-sm table-hover">
                    <thead>
                        <tr>
                            <th>{{$t('ShippingPackage_PackageNo')}}</th>
                            <th>{{$t('ShippingPackage_ShippingPackageTypeId')}}</th>
                            <th>{{$t('ShippingPackage_Quantity')}}</th>
                            <th>{{$t('ShippingPackage_Length')}}</th>
                            <th>{{$t('ShippingPackage_Width')}}</th>
                            <th>{{$t('ShippingPackage_Height')}}</th>
                            <th>{{$t('ShippingPackage_NettoWeight')}}</th>
                            <th>{{$t('ShippingPackage_GrossWeight')}}</th>
                            <th>{{$t('ShippingPackage_Volume')}}</th>
                        </tr>
                    </thead>
                    <tbody class="text-center">
                        <tr v-for="(p, index) in packages" :key="index">
                            <td>
                                <input type="text" v-model="p.packageNo" class="form-control" />
                            </td>
                            <td>
                                <select v-model="p.shippingPackageTypeId" class="form-control">
                                    <option v-for="o in $store.getters.ShippingPackage_ShippingPackageTypeId" :key="o.id" :value="o.id">{{o.text}}</option>
                                </select>
                            </td>
                            <td>
                                <input type="number" v-model="p.quantity" class="form-control" />
                            </td>
                            <td>
                                <div class="input-group">
                                    <input type="number" v-model="p.length" class="form-control" @change="changeVolume(p)" />
                                    <div class="input-group-append">
                                        <span class="input-group-text">m</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="input-group">
                                    <input type="number" v-model="p.width" class="form-control" @change="changeVolume(p)" />
                                    <div class="input-group-append">
                                        <span class="input-group-text">m</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="input-group">
                                    <input type="number" v-model="p.height" class="form-control" @change="changeVolume(p)" />
                                    <div class="input-group-append">
                                        <span class="input-group-text">m</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="input-group">
                                    <input type="number" v-model="p.nettoWeight" class="form-control" />
                                    <div class="input-group-append">
                                        <span class="input-group-text">m</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="input-group">
                                    <input type="number" v-model="p.grossWeight" class="form-control" />
                                    <div class="input-group-append">
                                        <span class="input-group-text">m</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="input-group">
                                    <input type="number" v-model="p.volume" class="form-control" disabled />
                                    <div class="input-group-append">
                                        <span class="input-group-text">m3</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
        <template slot="buttons">
            <button class="btn btn-leeuwen" @click="addPackage">Add Package</button>
        </template>
    </modal>
</template>

<script>

import Modal from '@/components/Modal';
import { shippingPackage } from '@/models/models.js'
export default {
    props: ['packingList'],
    components: {
        'modal': Modal
    },
    data() {
        return {
            packages: [new shippingPackage({
                packageNo: 1,
                quantity: 0,
                length: 0,
                width: 0,
                height: 0,
                volume: 0,
                grossWeight: 0,
                nettoWeight: 0,
                shippingPackageTypeId: 1,
                shippingId: this.shippingId
            })],
        }
    },
    created() {
    },
    mounted() {       
    },
    methods: {
        addPackage() {
            this.packages.push(new shippingPackage({
                packageNo: this.packages.length + 1,
                quantity: 0,
                length: 0,
                width: 0,
                height: 0,
                volume: 0,
                grossWeight: 0,
                nettoWeight: 0,
                shippingPackageTypeId: 1,
                shippingId: this.shippingId
            }));
        },
        changeVolume(p) {
            p.volume = p.length * p.width * p.height;
        },
        saveChanges() {
            this.packages.forEach((p) => {
                if(!p.shippingId)
                    p.shippingId = this.shippingId;
                    
                this.$http.post('api/ShippingPackages/', p).then((res) => {
                    this.$emit('reload');
                });
            });
        }
    },
    computed: {
        shippingId() {
            const col = this.packingList.columns.find((c) => { return c.label.toLowerCase() == "shipping_id" });
            if(!!col)
                return col.value;
            return null;
        }
    },
    watch: {
    }
}
</script>

<style scoped>
.table-hover tr 
{
    cursor: pointer;
}
.selected {
    background-color: lightgray;
}
</style>