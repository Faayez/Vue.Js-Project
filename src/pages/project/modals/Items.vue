<template>
    <modal id="itemsShippingModal" :save="saveChanges"  :showFooter="false">
        <template slot="title">Items</template>
        <template slot="body">
            <div class="table-responsive">
                <h3>Package</h3>
                <table class="table table-bordered table-sm table-hover">
                    <thead>
                        <tr>
                            <th>Package No</th>
                            <th>Quantity</th>
                            <th>Length (m)</th>
                            <th>Width (m)</th>
                            <th>Height (m)</th>
                            <th>Netto Weight (kg)</th>
                            <th>Gross Weight (kg)</th>
                            <th>Volume (m3)</th>
                        </tr>
                    </thead>
                    <tbody class="text-center">
                        <tr v-if="shippingPackage != null">
                            <td>
                                {{shippingPackage.packageNo}}
                            </td>
                            <td>
                                {{shippingPackage.quantity}}
                            </td>
                            <td>
                                {{shippingPackage.length}}
                            </td>
                            <td>
                                {{shippingPackage.width}}
                            </td>
                            <td>
                                {{shippingPackage.height}}
                            </td>
                            <td>
                                {{shippingPackage.nettoWeight}}
                            </td>
                            <td>
                                {{shippingPackage.grossWeight}}
                            </td>
                            <td>
                                {{shippingPackage.volume}} m3
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="row" v-if="shippingPackage != null">
                <div class="col-md-12">
                    <hr>
                </div>
                <div class="col-md-6">
                    <h3>Items For Package {{shippingPackage.packageNo}}</h3>
                </div>
                <div class="col-md-6">                
                    <file-input :get="'api/Items/GetExample'" :set="'api/Items/UploadItems/' + this.$route.params.projectId + '/' + this.shippingPackage.id" v-on:response="uploadItems"></file-input>
                </div>
            </div>  
            <div class="table-responsive" v-if="shippingPackage != null">              
                <table class="table table-bordered table-sm table-hover" >
                    <thead>
                        <tr>
                            <th>Quantity</th>
                            <th>PipeNo</th>
                            <th>HeatNo</th>
                            <th>CoilNo</th>
                            <th>Length</th>
                            <th>Weight</th>
                            <th>ReleaseDate</th>
                            <th>ReceivedDate</th>
                            <th class="text-center">
                                <button class="btn btn-leeuwen btn-sm" @click="removeAll">
                                    <v-icon name="trash-alt"></v-icon> All
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="text-center" v-if="items.length > 0">
                        <tr :key="item.id" v-for="item in items">
                            <td>
                                {{item.quantity}}
                            </td>
                            <td>
                                {{item.pipeNo}}
                            </td>
                            <td>
                                {{item.heatNo}}
                            </td>
                            <td>
                                {{item.coilNo}}
                            </td>
                            <td>
                                {{item.length}} {{item.lengthUnit}}
                            </td>
                            <td>
                                {{item.weight}} {{item.weightUnit}}
                            </td>
                            <td>
                                {{$d(item.releaseDate, 'short')}}
                            </td>
                            <td>
                                {{$d(item.receivedDate, 'short')}}
                            </td>
                            <td class="text-center">
                                <button class="btn btn-leeuwen btn-sm" @click="removeItem(item)">
                                    <v-icon name="trash-alt"></v-icon>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </modal>
</template>

<script>

import Modal from '@/components/Modal';
import FileInput from '@/components/FileInput';
export default {
    props: ['shippingPackage'],
    components: {
        'modal': Modal,
        'file-input': FileInput
    },
    data() {
        return {
            packages: [],
            items: [],
            isEditing: false,
            shippingPackageTypes: [],
            uploading: false,
            filename: "Choose file..."
        }
    },
    created() {
    },
    mounted() {       
    },
    methods: {
        getItems() {
            return this.$http.get('api/Items/GetItemsByShippingPackageId/' + this.shippingPackage.id).then((res) => {
                this.items = res.data.map((i) => {
                    i.releaseDate = new Date(i.releaseDate);
                    i.receivedDate = new Date(i.receivedDate);
                    return i;
                });
            });
        },
        changeFile(ev) {
            if(ev.currentTarget.files.length > 0)
            {
                this.filename = ev.currentTarget.files[0].name;
            } else {
                this.filename = null;
            }
        },
        uploadItems(res) {
            this.items = res;
        },
        removeItem(item) {
            return this.$http.delete('api/Items/' + item.id).then((res) => {
                this.items.splice(this.items.indexOf(item), 1);
            });
        },
        removeAll() {
            this.items.forEach((i) => {
                return this.$http.delete('api/Items/' + i.id).then((res) => {
                    this.items.splice(this.items.indexOf(i), 1);
                });
            });
        },
        saveChanges() {
            if(this.isValid) 
            {
                let dirty = [];
                let count = this.packages.filter((i) => { return i.isDirty }).length;
                this.packages.forEach((e) => {

                    if(e.isDirty && e.link == null) 
                    {
                        this.$http.put('api/ShippingPackages/' + e.id, e).then((res) => {
                            count--;
                            e.isDirty = false;
                            if(count == 0) 
                            {
                                document.querySelector("#splitShippingModal #closeBtn").click();
                                this.$emit('reload');
                            }
                        });
                    }

                    if(e.isDirty && e.link != null) 
                    {
                        this.$http.post('api/ShippingPackages/', e).then((res) => {
                            count--;
                            e.isDirty = false;
                            if(count == 0) 
                            {
                                document.querySelector("#splitShippingModal #closeBtn").click();
                                this.$emit('reload');
                            }
                        });
                    }
                });
                this.$emit('reload');
                return true;
            } else {
                alert("Please match the sum of the quantities with the total.");
                return false;
            }
        }
    },
    computed: {
    },
    watch: {
        package(to) {
            if(to != null)
            {
                this.getItems();
            }
        }
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