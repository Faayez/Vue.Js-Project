<template>
    <div class="table-responsive">
        <table class="table table-sm table-bordered">
            <thead>
                <tr>
                    <th v-for="(header, index) in computedHeaders" :key="index">{{$t(header)}}</th>
                    <slot name="th"></slot>
                </tr>
            </thead>
            <tbody>
                <tr @click="click(row)" v-for="(row, index) in data" :key="index" :class="{ 'active': row == selectedRow }">
                    <td v-for="(col, index) in row" :key="index">{{row[index]}}</td>
                    <slot name="td"></slot>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
export default {
    props: ['data', 'headers'],
    data() {
        return {
            selectedRow: null
        }
    },
    methods: {
        click(row) {
            this.selectedRow = row;
            this.$emit('click', row);
        }
    },
    computed: {
        cols() {
            let arr = [];
            this.data.forEach((r) => {
                for(let prop in r) 
                {
                    arr.push({ property: prop, value: r['prop'] });
                }
            });
            return arr;
        },
        computedHeaders() {
            if(this.headers == null || this.headers.length == 0) {
                var arr = [];
                for(let prop in this.data[0]) 
                {
                    arr.push(prop);
                }
                return arr;
            }
            return headers;
        }
    }
}
</script>
<style scoped>
th {
    background-color: #f7f7f7;
}
tr.active {
    background-color: #1658a6;
    color: white;
}
</style>