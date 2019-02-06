<template>
    <div id="calloforder">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-6">
                        <h5>PickingList Items</h5>
                    </div>
                    <div class="col-6 text-right">
                        <button title="Check All" class="btn btn-outline-leeuwen-blue btn-sm" @click="checkAll"><v-icon name="clone"></v-icon></button>
                        <button title="Download" class="btn btn-outline-leeuwen-blue btn-sm" @click="download"><v-icon name="download"></v-icon></button>
                        <button title="Create Shipping" class="btn btn-outline-leeuwen btn-sm" :disabled="!allPicked" @click="createShipping"><v-icon name="ship"></v-icon> Create Shipping</button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text">
                            <v-icon name="industry"></v-icon>
                        </span>
                    </div>
                    <select class="form-control" v-model="warehouse">
                        <option :value="null">All Warehouses</option>
                        <option v-for="(w, index) in warehouses" :key="index" :value="w">{{w}}</option>
                    </select>
                </div>
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text">
                            <v-icon name="search"></v-icon>
                        </span>
                    </div>
                    <input class="form-control" type="text" placeholder="Search Item..." v-model="filter" />
                </div>
                <div class="list-group mb-3">
                    <div class="list-group-item flex-column align-items-start" v-for="item in filteredPickingListItems" :key="item.id" :class="{ 'list-group-item-success': item.isPicked }">
                        <div class="d-flex w-100 justify-content-between mb-1">
                            <h5 class="mb-1"><span class="badge badge-secondary">{{item.quantity}} {{item.quantityUnit}}</span> {{item.articleNo}} | {{item.customerCode}}</h5>
                            <small><strong>Warehouse:</strong> {{item.warehouseName}} | <strong>Location:</strong> {{item.locationName}}</small>
                        </div>
                        <div class="row">
                            <div class="col-3">
                                <div class="input-group input-group-sm mb-1">
                                    <input title="Shipping Package" class="form-control" type="text" v-model="item.package" placeholder="Package..." :disabled="item.isPicked" />
                                    <div class="input-group-append">
                                        <span class="input-group-text">Package</span>
                                    </div>
                                </div>
                                <textarea title="Comments" class="form-control" type="text" v-model="item.comments" placeholder="Comments..." :disabled="item.isPicked"></textarea>
                            </div>
                            <div class="col-5">
                                <label>(Heat) Quantities</label><br>
                                <div class="input-group input-group-sm mb-1" v-for="(h, index) in item.heats" :key="index">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">{{h.heatNo}}</span>
                                    </div>
                                    <input type="number" class="form-control" :max="h.availableQuantity" min="0" :disabled="item.isPicked" v-model="h.quantity" />
                                    <div class="input-group-append">
                                        <span class="input-group-text">{{item.quantityUnit}}</span>
                                    </div>
                                </div>
                                <label>Total Quantity:</label> {{item.heats.map((c) => { return parseInt(c.quantity) }).reduce((a, b) => { return a + b }, 0)}}
                            </div>
                            <div class="col-4 text-right">
                                <checkbox title="Is Picked?" circle="true" :object="item" property="isPicked" :check="item.isPicked" size="3" class="inline" v-on:toggle="togglePicked"></checkbox>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CheckBox from '@/components/CheckBox'
import Modal from '@/components/Modal'
import StockList from '@/components/StockList'

export default {
    components: {
        'modal': Modal,
        'checkbox': CheckBox,
        'stocklist': StockList
    },
    data() {
        return {
            pickingListItems: [],
            newItems: [],
            isDirty: false,
            filter: '',
            warehouse: null
        }
    },
    created() {
        this.getPickingListItems(this.$route.params.pickingListId);
    },
    methods: {
        getPickingListItems(id) {
            this.$http.get('api/PickingLists/Items/' + id).then((res) => {
                this.pickingListItems = res.data.map((c) => {
                    if(c.heats.length == 0)
                    {
                        c.heats = [{
                            heatNo: 'Any',
                            quantity: 0,
                            availableQuantity: 1000
                        }];
                    } else {
                        c.heats = c.heats.map((h) => {
                            h.heatNo = (!h.heatNo || h.heatNo == '') ? 'Any' : h.heatNo;
                            h.quantity = parseInt(h.quantity);
                            return h;
                        });
                    }
                    c.articleNo = (!c.articleNo) ? '' : c.articleNo;
                    c.customerCode = (!c.customerCode) ? '' : c.customerCode;
                    return c;
                });
            });
        },
        togglePicked(item, prop, check)
        {   
            if(item.quantity != item.heats.map((c) => { return parseInt(c.quantity) }).reduce((a, b) => { return a + b}, 0))
            {
                return item[prop] = false;
            };

            if(!item.package)
                return item[prop] = false;
            
            return item[prop] = check;
        },
        checkAll() {
            this.filteredPickingListItems.forEach((i) => {
                if(!!i.package && i.quantity == i.heats.map((c) => { return parseInt(c.quantity) }).reduce((a, b) => { return a + b }, 0))
                {
                    i.isPicked = !(i.isPicked);
                }
            });
        },
        download() {            
            let items = this.filteredPickingListItems.map((c) => { return c.id });
            if(items.length == 0)
                return alert("Please Make Items Available First.");

            this.$http.post('api/PickingLists/Download/' + this.$route.params.projectId, items, { responseType: 'blob' }).then((res) => {
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
        createShipping() {
            let items = this.pickingListItems.map((c) => {
                c.heats = c.heats.filter((c) => { return c.quantity > 0 }).map((h) => {
                        return {
                            heatNo: h.heatNo,
                            quantity: h.quantity
                        }
                    })
                return c;
            });
            this.$http.post('api/PickingLists/CreateShipping/' + this.$route.params.projectId, items).then((res) =>
            {
                this.pickingListItems = [];
            });
        },
    },
    computed: {
        pickingListId() {
            return this.$route.params.pickingListId;
        },
        allPicked() {
            return !this.pickingListItems.some((c) => { return c.isPicked == false });
        },
        filteredPickingListItems() {
            return this.pickingListItems.filter((c) => { 
                return (c.articleNo.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0 || c.customerCode.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0)
                && (c.warehouseName == this.warehouse || !this.warehouse);
            });
        },
        warehouses() {
            let warehouses = [];
            this.pickingListItems.forEach((i) => {
                if(!warehouses.some((w) => { return w == i.warehouseName }))
                    warehouses.push(i.warehouseName);
            })
            return warehouses;
        }
    },
    watch: {
        pickingListId(to)
        {
            this.getPickingListItems(to);
        }
    }

}
</script>

<style scoped>
.inline {
    display: inline-block;
}


</style>