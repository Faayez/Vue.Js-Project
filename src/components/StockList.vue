<template>
    <div id="stockList">
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <span class="input-group-text">
                    <v-icon name="search"></v-icon>
                </span>
            </div>
            <input type="text" class="form-control" v-model="artNo" placeholder="Search Article No...">
        </div>
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <span class="input-group-text">
                    <v-icon name="search"></v-icon>
                </span>
            </div>
            <input type="text" class="form-control" v-model="customerCode" placeholder="Search Customer Item...">
        </div>
        <hr>
        <div class="alert alert-danger" role="alert" v-if="failed">
            <strong>Failed!</strong> Could not load stock data.
        </div>
        <loader :loading="loading"></loader>
        <div class="list-group">
            <div class="list-group-item flex-column align-items-start" v-for="(s, index) in stock" :key="index">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{s.customerCode}}</h5>
                </div>
                <div class="row">
                    <div class="col-6">
                        <p class="mb-1">Art: {{s.articleNo}} | Size: {{s.size}} | NFI No: {{s.nfiNo}} | {{s.quantityUnit}}</p>
                        <small>Stored at: {{s.warehouseName}} - {{s.locationName}}</small>
                    </div>
                    <div class="col-6">
                        <number-input :obj="s" :qty="s.quantity" min="0" :max="s.orgQuantity" v-on:change="change"></number-input>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import NumberInput from '@/components/NumberInput';
import Loader from '@/components/Loader';
export default {
    name: 'stocklist',
    components: {
        'number-input': NumberInput,
        'loader': Loader
    },
    data() {
        return {
            artNo: null,
            customerCode: null,
            stock: [],
            loading: false,
            failed: false
        }
    },
    created() {
        this.getStockList();
    },
    methods: {
        getStockList() {
            this.loading = true;
            this.failed = false;
            let query = "?";
            if(!!this.artNo)  
                query += 'artNo=' + this.artNo + '&';
            if(!!this.customerCode)  
                query += 'customerCode=' + this.customerCode;

            this.$http.get('api/Stock/' + this.$route.params.projectId + query).then((res) => {
                this.stock = res.data.map((s) => {
                    s.orgQuantity = s.quantity;
                    return s;
                });
                return this.loading = false;
            }).catch((err) =>
            {
                this.failed = true;
                this.loading = false;
            })
        },
        change(qty, item) 
        {
            item.quantity = qty;

            if(qty > item.orgQuantity)
            {
                item.quantity = item.orgQuantity;
            }
            if(qty < 0)
            {
                item.quantity = 0;
            }
            this.$emit("change", item.quantity, item);
        }
    },
    watch: {
        artNo(to)
        {
            this.getStockList();
        },
        customerCode(to)
        {
            this.getStockList();
        }
    }
}
</script>