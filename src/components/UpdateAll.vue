<template>
    <div class="input-group">
        <select type="text" class="form-control" v-model="selectedColumn">
            <option>Please select a column...</option>
            <option :key="index" v-for="(col, index) in columns" :value="col">{{$t(col.text)}}</option>
        </select>
        <input :type="columnType" class="form-control" v-model="selectedColumnValue" />
        <div class="input-group-append">
            <button type="button" class="btn btn-outline-secondary" :disabled="disabledBtns" @click="updateAll">Update All</button>
        </div>
        <div class="input-group-append">
            <button type="button" class="btn btn-leeuwen" :disabled="disabledBtns" @click="eraseAll">Erase All</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'update-all',
    props: ['table'],
    data() {
        return {
            selectedColumn: "Please select a column...",
            selectedColumnValue: null
        }
    },
    methods: {
        updateAll() {
            if(!this.selectedColumn.text)
                return;

            let property = this.selectedColumn.text.toLowerCase(),
                value = this.selectedColumnValue,
                idx = this.selectedRows[0].columns.findIndex((c) => { return c.label.toLowerCase() == property });
    
            this.selectedRows.forEach((r) => {
                let col = r.columns[idx];
                if(col != null) {
                    col.value = value;
                    col.isDirty = true;
                    
                    var obj = 
                    {
                        value: col.value,
                        entity: col.entity,
                        property: col.property,
                        key: col.key,
                        type: col.type
                    }; 

                    this.$http.post(this.table.options.saveApi, obj).then((res) => {
                        col.value = (res.data == "") ? null : res.data;
                        col.orgValue = col.value;
                        col.isDirty = false;
                    });
                };
            });
        },
        eraseAll() {
            if(!this.selectedColumn.text)
                return;

            let property = this.selectedColumn.text.toLowerCase(),
                value = this.selectedColumnValue,
                idx = this.selectedRows[0].columns.findIndex((c) => { return c.label.toLowerCase() == property });

            this.selectedRows.forEach((r) => {
                const col = r.columns[idx];
                if(col != null) {
                    col.value = value;
                    col.isDirty = true;
                    
                    var obj = 
                    {
                        value: null,
                        entity: col.entity,
                        property: col.property,
                        key: col.key,
                        type: col.type
                    };

                    this.$http.post(this.table.options.saveApi, obj).then((res) => {
                        col.value = (res.data == "") ? null : res.data;
                        col.orgValue = col.value,
                        col.isDirty = false;
                    });
                }
            });
        },
    },
    computed: {
        columns() {
            if(this.table != null) {
                return this.table.headers.filter((h) => {
                    return h.visible && h.edit;
                });
            };
            return [];
        },
        selectedRows() {
            if(this.table != null && this.table.selectedRows.length > 0) {
                return this.table.selectedRows;
            };
            return [];
        },
        columnType() {
            return this.selectedColumn.type;
        },
        disabledBtns() {
            if(this.table != null) {
                return (this.table.selectedRows.length == 0) ? true : false;
            };
            return true;
        },
    }
}
</script>

<style scoped>
</style>