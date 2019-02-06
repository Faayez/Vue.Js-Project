<template>
    <div id="calloforder">
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5>Call-Off Order</h5>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-success fade show" role="alert" v-show="success">
                            <strong>Success!</strong> A new pickinglist is created with ID: {{this.pickingListId}}.
                        </div>
                        <form @submit.prevent="createPickingList">
                        <div class="input-group mb-3" v-if="callOfOrder.pickingListItems.length > 0">
                            <input class="form-control" type="text" v-model="callOfOrder.name" placeholder="Name of PickingList..." required />
                            <div class="input-group-append">
                                <button class="btn btn-leeuwen" type="submit" >Create Pickinglist</button>
                            </div>
                        </div>
                        </form>
                        <div class="list-group">
                            <div class="list-group-item flex-column align-items-start" v-for="(s, index) in callOfOrder.pickingListItems" :key="index">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">{{s.customerCode}}</h5>
                                </div>
                                <div class="row">
                                    <div class="col-8">
                                        <p class="mb-1">Art: {{s.articleNo}} | Size: {{s.size}} | NFI No: {{s.nfiNo}} | {{s.quantityUnit}}</p>
                                        <small>Stored at: {{s.warehouseName}} - {{s.locationName}}</small>
                                    </div>
                                    <div class="col-4">
                                        <number-input :obj="s" :qty="s.orgQuantity - s.quantity" min="0" :max="s.orgQuantity" @change="changePickingList"></number-input>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Stock List</h5>
                    </div>
                    <div class="card-body">
                        <stocklist @change="change"></stocklist>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Table from '@/components/Table';
import NumberInput from '@/components/NumberInput';
import StockList from '@/components/StockList';
export default {
    components: {
        'table-component': Table,
        'stocklist': StockList,
        'number-input': NumberInput,
    },
    data() {
        return {
            callOfOrder: 
            {   
                projectId: this.$route.params.projectId,
                name: null,
                pickingListItems: []
            },
            pickingListId: null,
            success: false
        }
    },
    created() {
    },
    methods: {
        changePickingList(qty, item)
        {
            if(item.quantity != item.orgQuantity - qty)
                item.quantity = item.orgQuantity - qty;
        },
        change(qty, item)
        {
            if(item.quantity >= item.orgQuantity)
            {
                item.quantity = item.orgQuantity;

                if(this.callOfOrder.pickingListItems.some((s) => { return s == item}))
                    this.callOfOrder.pickingListItems.splice(this.callOfOrder.pickingListItems.indexOf(item), 1);
                return;
            }

            if(item.quantity < 0)
            {
                item.quantity = 0;
                if(!this.callOfOrder.pickingListItems.some((s) => { return s == item}))
                    this.callOfOrder.pickingListItems.push(item);
                return;
            }
            
            if(!this.callOfOrder.pickingListItems.some((s) => { return s == item}))
                this.callOfOrder.pickingListItems.push(item);

            return;
        },
        createPickingList() {
            if(!this.callOfOrder.name)
                return alert("Please provide a name...");

            let pickingList = {
                projectId: this.callOfOrder.projectId,
                name: this.callOfOrder.name,
                pickingListItems: this.callOfOrder.pickingListItems.map((c) => {
                    return {
                        stockItemId: c.id,
                        quantity: c.orgQuantity - c.quantity
                    }
                })
            };
            this.$http.post('api/PickingLists/Create/' + this.$route.params.projectId, pickingList).then((res) => {
                this.pickingListId = res.data.id;
                this.success = true;
                this.callOfOrder.name = null;
                this.callOfOrder.pickingListItems = [];
            }).catch((err) => {
                alert(err);
            });
        }
    },
    watch: {
    }

}
</script>

<style scoped>
.card-header h5 {
    margin: 0;
}
</style>