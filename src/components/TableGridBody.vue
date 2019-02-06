<template>
    <div >
        <tr :key="rowIndex" v-for="(row, rowIndex) in sortedRows" :class="{ 'selected': row.selected }">
            <td @click="selectRow(row)" class="selectCol text-center" v-if="options.selectable">
                <v-icon name="check" v-bind:class="[row.selected ? 'checked' : 'unchecked']"></v-icon>
            </td>
            <td :key="colIndex" v-for="(col, colIndex) in row.columns" :ref="id +'_col_' + rowIndex + '_' + colIndex" :id="id +'_col_' + rowIndex + '_' + colIndex" @click="editField(col, row, $event)" v-if="isVisible(col)" :class="{ 'disabled': col.key === 0, 'editable': col.edit, 'active': col.isEditing}" >
                <template v-if="col.edit && !!options.select && options.select.findIndex((c) => { return c.id.toLowerCase() == col.label.toLowerCase() }) >= 0">
                    <select v-model="col.value" class="form-control-plaintext" @blur="editField(col, row, $event)">
                        <option v-for="v in options.select.find((c) => { return c.id.toLowerCase() == col.label.toLowerCase() }).values" :key="v.id" :value="v.id">
                            {{v.text}}
                        </option>
                    </select>
                </template>

                <template v-else>
                    <span v-if="!col.isEditing && col.type != 'date'" v-bind:class="{ 'dirty': col.isDirty, 'editable': col.edit }" :title="col.value">{{ col.value }}</span>
                    <span v-if="!col.isEditing && col.type == 'date' && col.value != null" v-bind:class="{ 'dirty': col.isDirty, 'editable': col.edit }" :title="col.value">{{ $d(new Date(col.value), 'short') }}</span>
                    <div class="input-group input-group-sm" v-show="col.isEditing" >
                            <input :type="col.type" class="form-control-plaintext" v-model="col.value" @blur="editField(col, row, $event)" />
                    </div>
                </template>

            </td>
        </tr>
        <tr v-if="filteredRows.length < totalCount">
            <td class="text-center" :colspan="headers.length + 1" @click="loadNext">
                <v-icon name="angle-double-down"></v-icon>
            </td>
        </tr>
    </div>
</template>
<script>
export default {
    name: 'table-grid-body',
    props: ['headers', 'options', 'sort', 'asc', 'loading'],
    data() {
        return {
            rows: [],
            totalCount: 0
        }
    },
    mounted() {
        const arrowKeys = [9, 13, 37, 38, 39, 40], //tab, left, up, right, down
                nodes = ["INPUT", "SELECT"];
        
        const table = document.getElementById(this.id);
        table.addEventListener('keydown', (e) => { 
            if(arrowKeys.some((k) => { return e.keyCode === k }) && nodes.some((n) => { return document.activeElement.nodeName.toUpperCase() === n }))
            {
                e.preventDefault();
                return this.keyHandler(e);
            }
        });
    },
    methods: 
    {
        getWidth(col) {
            return this.headers.find((c) => { return c.text == col.label }).width + 'px';
        },
        isVisible(col) 
        {
            let header = this.headers.find((c) => { return c.text === col.label });
            if(header.visible == null)
                return false;
            return header.visible;
        },
        editField(col, row, ev) 
        {
            if(this.options.readonly || !col.edit) {
                this.selectRow(row);
            } 
            else 
            {
                if(col.edit || this.options.edit != null) 
                {
                    if(col.edit || this.options.edit.indexOf(col.label) >= 0) 
                    {
                        let target = ev.currentTarget;
                        if(target.tagName.toUpperCase() === 'TD') 
                        {
                            col.isEditing = true;
                            //this.selectRow(row);
                            setTimeout(() => {
                                target.querySelector('input, select').focus();
                                target.querySelector('input, select').onfocusout = () => { 
                                    this.setDirty(col);
                                    col.isEditing = false;
                                };
                            }, 1);
                        }
                    }
                }
            }
        },
        selectRow(row)
        {
            let value = row.selected;
            if(!this.options.multiple) 
            {
                this.rows.forEach((r) => { r.selected = false });
            };
            
            row.selected = (value) ? false : true;

            return this.$emit('select', row);
        },
        loadNext() {
            return this.$emit('loadNext', row);
        },
        setDirty(col) 
        {
            if(col.orgValue != col.value) 
            {
                col.isDirty = true;
                if(this.options.autoSave == true) 
                {
                    this.saveEntity(col);
                }
            } 
        },
        saveEntity(col) 
        {
            var obj = 
            {
                value: col.value,
                entity: col.entity,
                property: col.property,
                key: col.key,
                type: col.type
            };

            this.$http.post(this.options.saveApi, obj).then((res) => {
                if(col.type == "date")
                {
                    col.value = new Date(res.data);
                } else 
                {
                    col.value = res.data;
                }
                col.orgValue = col.value;
                col.isDirty = false;
                this.$emit('update', col);
            }).catch((err) => {
                col.value = col.orgValue;
                col.isDirty = false;
                alert(err.data);
            });
        },
        keyHandler(e) 
        {
            if(e.target.closest('td') == null)
                return;
                
            const id = e.target.closest('td').id,
                row = parseInt(id.split("_")[id.split("_").length - 2]),
                col = parseInt(id.split("_")[id.split("_").length - 1]),
                current = this.sortedRows[row].columns[col];

            
            let edit = null,
                colIndex,
                refs,
                target;

            const TABKEY = 9,
                    LEFT = 37,
                    UP = 38,
                    RIGHT = 39,
                    DOWN = 40,
                    ENTER = 13;

            switch(e.keyCode)
            {
                case RIGHT:
                case TABKEY:
                    edit = this.sortedRows[row].columns.find((c) => { 
                        return c.edit && c.id > current.id;
                    });
                    if(!!edit)
                    {
                        colIndex = this.sortedRows[row].columns.findIndex((c) => { return c.id == edit.id }),
                        refs = this.$refs[this.id + "_col_" + row + "_" + colIndex];
                        if(refs != null)
                        {
                            target = refs[0];
                            current.isEditing = false;
                            this.editField(edit, this.sortedRows[row], { currentTarget: target });
                        }
                    }

                    break;
                case LEFT:
                    edit = this.sortedRows[row].columns.filter((c) => { 
                        return c.edit && c.id < current.id;
                    });
                    if(edit.length > 0) 
                    {
                        colIndex = this.sortedRows[row].columns.findIndex((c) => { return c.id == edit[edit.length - 1].id }),
                        refs = this.$refs[this.id + "_col_" + row + "_" + colIndex];
                        if(refs != null) 
                        {
                            target = refs[0];
                            current.isEditing = false;
                            this.editField(edit[edit.length - 1], this.sortedRows[row], { currentTarget: target });
                        }
                    }

                    break;
                case ENTER:
                case DOWN:
                    refs = this.$refs[this.id + "_col_" + (row + 1) + "_" + col];
                    if(refs != null)
                        target = refs[0];

                    if(target != null)
                    {
                        current.isEditing = false;
                        this.editField(this.sortedRows[row + 1].columns[col], this.sortedRows[row + 1], { currentTarget: target });
                    }
                    break;
                case UP:
                    refs = this.$refs[this.id + "_col_" + (row - 1) + "_" + col];
                    if(refs != null)
                        target = refs[0];

                    if(target != null)
                    {
                        current.isEditing = false;
                        this.editField(this.sortedRows[row - 1].columns[col], this.sortedRows[row - 1], { currentTarget: target });
                    }
                    break;
            }
        },
    },
    watch: {
        //filters() {
            //if(this.isFullLoad)
            //{
                //if(this.options.fixed || this.options.fixed == null) 
                //{
                    //this.$parent.setFixedTable();
                //}
            //};
        //},
    },
    computed: {
        id() {
            return this.$parent.$parent.id;
        },
        filteredRows() {
            if(this.filters.length == 0)
                return this.rows;

            return this.rows.filter((r) => {
                if(r.columns.some((c) => {
                    if(this.filters.some((f) => 
                        { 
                            return c.propertyName == f.column && c.text != null && c.text.toString().indexOf(f.value) >= 0; 
                        }
                    ))
                    {
                        return c;
                    }
                })) 
                {
                    return r;
                }
            });
        },
        sortedRows() {
            if(this.sort == null) 
            {
                return this.filteredRows;
            } 
            else 
            {
                console.log("Sorting rows...");
                let index = this.headers.findIndex((c) => { return c.value === this.sort });

                if(this.asc) 
                {
                    return this.filteredRows.sort((a,b) => { 
                        if(a.columns[index] == null || b.columns[index] == null)
                            return 0;
                        return (a.columns[index].value < b.cols[index].value) ? -1 : (a.columns[index].value > b.columns[index].value ? 1 : 0) 
                    })
                } 
                else 
                {
                    return this.filteredRows.sort((a,b) => { 
                        if(a.columns[index] == null || b.columns[index] == null)
                            return 0;
                        return (a.columns[index].value > b.columns[index].value) ? -1 : (a.columns[index].text < b.columns[index].value ? 1 : 0);
                    })
                }
            }
        },
        filters() 
        {
            let array = [],
                filterHeaders = this.headers.filter((h) => { return h.filter != null && h.filter.length > 0 });
            
            filterHeaders.forEach((f) => {
                array.push({ column: f.value, query: 'like', value: f.filter });
            });
            
            return array;
        }
    }
}
</script>
<style scoped>
tbody {
    overflow-y:auto;
}
tbody td {
    white-space: nowrap;
}
.selectCol {
    width: 35px;
    max-width: 35px;
}
.selected {
    background-color: lightgray !important;
}
.checked {
    color: black;
}
.unchecked {
    color: lightgray;
}
.dirty {
    color: red!important;
}
.editable {
    color: #28a745;
}
.remove:hover {
    cursor:pointer;
}
.form-control-plaintext {
    padding: 0;
}
.disabled{
    background-color: rgba(0,0,0,0.005);
}
</style>