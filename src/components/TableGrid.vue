<template>
    <div v-bind:id="id" class="table-data-grid">
            <div class="" v-bind:class="{ 'show-settings': !defaultOptions.settings }">                
                <table-grid-settings v-if="defaultOptions.settings" :loading="isLoading" :bulkupload="defaultOptions.bulkupload"></table-grid-settings>
            </div>
            <div class="box" >
                <scroll-table :loading="isLoading" :hasData="hasData" ref="scroll-table" :contextMenu="contextMenu">
                    <template slot="thead">
                        <table-grid-header :headers="headers" :options="defaultOptions" v-on:selectAll="selectAllRows" :filter="isFilterVisisble" v-on:sort="sorting"></table-grid-header>
                    </template>
                    <template slot="tbody">
                        <table-grid-body :headers="headers" :options="defaultOptions" :ref="'table_body_' + id" :sort="sort" :asc="asc" v-on:select="select" @update="update"></table-grid-body>
                    </template>
                </scroll-table>
            </div>
    </div>
</template>

<script>
import TableGridHeader from '@/components/TableGridHeader';
import TableGridBody from '@/components/TableGridBody';
import TableGridSettings from '@/components/TableGridSettings';
import ScrollTable from '@/components/ScrollTable';
import { row } from '@/models';

export default {
    name: 'table-grid',
    props: {
        id: { type: String, required: true },
        options: { type: Object, required: true, default: () => {} },
        data: { type: Array, required: false, default: null },
        contextMenu: { type: Array, required: false, default: () => [] }
    },
    components: {
        'table-grid-header': TableGridHeader,
        'table-grid-body': TableGridBody,
        'table-grid-settings': TableGridSettings,
        'scroll-table': ScrollTable
    },
    data () {
        return {
            init: false,
            isLoading: false,
            isFullLoad: false,
            userOptions: null,
            rowHeight: 50,
            rowIndex: 0,
            sort: null,
            asc: true,
            skip: 0,
            headers: [],
            totalCount: 0,
            isFilterVisisble: false,
            rows: [],
            scrollLeft: 0
        }
    },
    mounted () {
        window.addEventListener("resize", this.setWidth);

        this.initLoad();

        var tbody = document.getElementById(this.id).querySelector('tbody');
        tbody.addEventListener("scroll", this.onScroll);
        tbody.addEventListener('keydown', this.keyHandler, false);

        if(!this.options.full) 
        {
            let box = document.getElementById(this.id).querySelector('.box'),
                tbody = document.getElementById(this.id).querySelector('tbody');
            box.style.height = Math.ceil(this.options.take/3*2) * 30 + 'px';
            tbody.style.height = Math.ceil(this.options.take/3*2) * 30 + 'px';
        };
    },
    methods: {
        select(row)
        {
            this.$emit('select', row);
        },
        setHeaders(data) 
        {
            console.log('Set Table Headers For: ' + this.id);
            const row = data[0];
                //obj = row.columns[0];
            let index = 0;

            this.headers = [];
            if(this.defaultOptions != null && this.defaultOptions.headers != null) {
                this.headers = this.defaultOptions.headers;
            } 
            else 
            {
                row.columns.forEach((col) => {
                    let edit = (col.edit == null) ? false : col.edit;

                    const visible = (col.visible == null) ? true : col.visible,
                        header = { id: index++, visible: visible, sort: false, filter: { value: null, equal: false }, edit: edit, text: col.label, type: col.type }

                    if(this.defaultOptions.hidden != null)
                    {
                        if(col.property != null)
                        {
                            if(this.defaultOptions.hidden.indexOf(col.property) >= 0)
                            {
                                header.visible = false;
                            }
                        }
                    }
                    
                    this.headers.push(header);
                });
            };
        },
        setWidth() {
            setTimeout(() => {
                console.log('Set Table Fixed Width For: ' + this.id);
                let self = this,
                    table = document.getElementById(this.id),
                    ref = this.$refs['scroll-table'];
                
                for(let i = 2; i <= table.querySelectorAll('tr:nth-child(1) th').length; i++)
                {
                    let width = 65;
                    let tds = table.querySelectorAll('tr > td:nth-child(' + i + ')');
                    let thWidth = table.querySelector('tr > th:nth-child(' + i + ')').offsetWidth;
                    
                    tds.forEach((t) => {
                        if(t.querySelector(':first-child') != null && t.querySelector(':first-child').offsetWidth > width) 
                        {
                            width = t.querySelector(':first-child').offsetWidth + 10;
                        };
                    });

                    width = (width < thWidth) ? thWidth : width;

                    table.querySelector('tr:nth-child(1) > th:nth-child(' + i + ')').style.minWidth = width + 'px';
                    table.querySelector('tr:nth-child(1) > th:nth-child(' + i + ')').style.maxWidth = width + 'px';
                    table.querySelector('tr:nth-child(1) > th:nth-child(' + i + ')').style.width = width + 'px';
                    table.querySelector('tr:nth-child(2) > th:nth-child(' + i + ')').style.minWidth = width + 'px';
                    table.querySelector('tr:nth-child(2) > th:nth-child(' + i + ')').style.maxWidth = width + 'px';
                    table.querySelector('tr:nth-child(2) > th:nth-child(' + i + ')').style.width = width + 'px';

                    tds.forEach((t) => {
                        t.style.minWidth = width + 'px';
                        t.style.maxWidth = width + 'px';
                        t.style.width = width + 'px';
                    });
                }
                
                if(table.querySelector('thead tr').offsetWidth < table.querySelector('.box').offsetWidth) 
                {
                    const diff = (table.querySelector('thead div').offsetWidth - table.querySelector('thead tr').offsetWidth);
                    let ths = table.querySelectorAll('tr:nth-child(1) > th').length;
                    for(let i = 1; i <= ths; i++) 
                    {
                        let h = table.querySelector('tr:nth-child(1) th:nth-child(' + i + ')');
                        let width = h.offsetWidth + parseInt(diff / ths);
                        if(h != null)
                        {
                            h.style.minWidth = width + 'px';
                            h.style.maxWidth = width + 'px';
                            h.style.width = width + 'px';
                        }

                        h = table.querySelector('tr:nth-child(2) th:nth-child(' + i + ')');
                        if(h != null)
                        {
                            h.style.minWidth = width + 'px';
                            h.style.maxWidth = width + 'px';
                            h.style.width = width + 'px';
                        }

                        let t = table.querySelector('tr td:nth-child(' + i + ')');
                        if(t != null) {
                            t.style.minWidth = width + 'px';
                            t.style.maxWidth = width + 'px';
                            t.style.width = width + 'px';
                        }
                    };
                    return;
                }
            });
        },
        onScroll (ev) 
        {
            if(ev.currentTarget.scrollLeft != this.scrollLeft) 
            {
                this.scrollLeft = ev.currentTarget.scrollLeft;
                return;
            };

            if(!this.isLoading && !this.isFullLoad) {
                let tbody = document.getElementById(this.id).querySelector('tbody'),
                    rowHeight = tbody.querySelector('tr').offsetHeight,
                    tableHeight = rowHeight * this.rows.length,
                    currentPosition = ev.currentTarget.scrollTop + ev.currentTarget.offsetHeight;

                if(currentPosition >= tableHeight - (rowHeight * (this.visibleRows / 2))) 
                {
                    console.log('Load Next Due Scroll Down For: ' + this.id);
                    this.skip = this.rows.length;
                };
            }
        },
        getUserOptions() 
        {
            this.isLoading = true;
            return this.$http.get("api/UserTableOptions/" + this.id).then((res) => {
                this.userOptions = (res.data == "") ? null : res.data;
                this.isLoading = false;
                return res.data;
            }).catch((err) => {
                console.log("No User Options");
                return null;
            })
        },
        initLoad () 
        {
            if(!this.defaultOptions.api)
                return;

            console.log('Initialise Table: ' + this.id);
            if(!this.defaultOptions.settings) 
            {   
                let table = document.getElementById(this.id)
                table.querySelector('.box').style.width = '100%';
            }

            if(this.isDirty) 
            {
                alert("Please save first");
                return;
            };

            this.init = false;
            this.skip = 0;
            this.rows = [];
            this.getUserOptions().then((res) => 
            { 
                this.load().then((res) => 
                {
                    if(res != null && ((res.data.data != null && res.data.data.length > 0) || res.data.length > 0)) 
                    {
                        let rows = (res.data.data != null) ? res.data.data : res.data;
                        
                        this.setHeaders(rows);
                        
                        this.loadRows(rows);

                        this.isFullLoad = (res.data.totalCount == this.rows.length || res.data.totalCount == null) ? true : false;
                    } else {
                        this.loadRows([]);
                        this.isLoading = false;
                    }
                    this.init = true;
                });
            });
        },
        load () 
        {
            this.isLoading = true;
            console.log('Loading Data For: ' + this.id);
            
            if(this.data != null) {
                return new Promise((resolve, reject) => {
                    let resp = {
                        data: {
                            data: this.data,
                            totalCount: this.data.length
                        }
                    };
                    this.totalCount = resp.data.totalCount;
                    this.isLoading = false;
                    resolve(resp);
                });
            };

            const hasParams = (this.defaultOptions.api.split("?").length > 1) ? '&' : '?',
                        url = this.defaultOptions.api + hasParams + this.queryString;
            return this.$http.get(url).then((res) => {
                if(res.data != null) {
                    this.totalCount = (res.data.totalCount != null) ? res.data.totalCount : res.data.length;

                    if(this.totalCount == 0)
                    {
                        this.skip = 0;
                    }
                }
                return res;
            }).catch((err) => {
                this.isLoading = false;
            });
        },
        loadNext() 
        {
            console.log("Load Next Data For: " + this.id);
            this.load().then((res) => 
            {
                let data = (res.data.data == null) ? res.data : res.data.data;
                
                this.appendRows(data);
            });
        },
        loadAll () 
        {
            if(!this.isFullLoad) 
            {
                console.log("Load All Data For: " + this.id);
                let self = this;

                let interval = setInterval(() => {
                    if(!self.isLoading && !self.isFullLoad) {
                        self.skip = self.rows.length;
                        //self.loadNext();
                    };

                    if(self.isFullLoad)
                        clearInterval(interval);
                }, 250);
            };
        },
        loadRows(data) 
        {
            console.log('Load new rows...');
            let arr = data.map((r) => { return new row(r) }).distinct();
            
            this.$refs['table_body_' + this.id].rows = arr;
            this.rows = arr;
            
            this.isFullLoad = (this.rows.length == this.totalCount) ? true : false;

            const self = this;
            setTimeout(() => {
                if(!self.isFullLoad && document.querySelector('#' + self.id + ' tbody div').offsetHeight < document.querySelector('#' + self.id + ' tbody').offsetHeight)
                {
                    console.log('Load next rows...');
                    return self.skip = self.rows.length;
                }
                
                if(self.rows.length > 0)
                    self.setWidth();
                self.isLoading = false;
            }, 1);
        },
        appendRows(data) 
        {
            console.log('Append Rows For:' + this.id);
            const table = this.$refs['table_body_' + this.id];
            const arr = data.map((r) => { return new row(r, this.rowIndex++)} ).distinct();

            arr.forEach((r) => {
                table.rows.push(r);
            });
            
            this.isFullLoad = (this.rows.length == this.totalCount) ? true : false;

            const self = this;
            setTimeout(() => {
                if(!self.isFullLoad && document.querySelector('#' + self.id + ' tbody div').offsetHeight < document.querySelector('#' + self.id + ' tbody').offsetHeight)
                {
                    console.log('Load next rows...');
                    return self.skip = self.rows.length;
                }

                if(self.rows.length > 0)
                    self.setWidth();
                self.isLoading = false;
            }, 1);
        },
        saveChanges() 
        {
            console.log('Save Changes For:' + this.id);
            this.dirtyRows.forEach((r) => {

                let columns = r.columns.filter((c) => { 
                    return c.isDirty;
                });
                columns.forEach((c) => {
                    this.$refs["table_body_" + this.id].saveEntity(c);
                })
                
            });
        },
        selectAllRows () 
        {
            if(this.options.multiple) {
                if(this.allRowsSelected) 
                {
                    this.rows.forEach((row) => { row.selected = false; });
                } 
                else 
                {
                    this.rows.forEach((row) => { row.selected = true; });
                }
            }
        },
        sorting(header, asc) {
            if(asc != null) 
            {
                this.asc = asc;
            } else {

            }
            this.sort = header;
            this.skip = 0;
        },
        update(col)
        {
            this.$emit('update', col);
        }
    },
    watch: {
        queryString(newValue, oldValue) 
        {
            console.log("QueryString Changed: " + newValue);

            let newValueParams = new URLSearchParams(newValue),
                oldValueParams = new URLSearchParams(oldValue),
                oldFilters = oldValueParams.get('filters'),
                newFilters = newValueParams.get('filters'),
                oldSkip = oldValueParams.get('skip'),
                newSkip = newValueParams.get('skip');
            
            //if(!this.isFullLoad) 
            //{
                if(oldFilters != newFilters && newSkip > 0) 
                {
                    return this.skip = 0;
                }

                if(newSkip == 0) 
                {
                    this.$refs['table_body_' + this.id].rows = [];
                }
            
                this.load().then((res) => 
                {
                    if(newSkip == 0) 
                    {
                        this.loadRows(res.data.data);
                    } 
                    else 
                    {
                        this.appendRows(res.data.data);
                    }
                    
                    if(this.rows.length >= res.data.totalCount) 
                    {
                        this.isFullLoad = true;
                    };

                    this.isLoading = false;
                });
            //};
        }
    },
    computed: {
        filters()  {
            if(this.$refs['table_body_' + this.id] != null) {
                return this.$refs['table_body_' + this.id].filters;
            }
            return [];
        },
        defaultOptions() 
        {
            let options = this.options;
            if(this.userOptions != null)
            {
                let hidden = [];
                this.userOptions.headers.forEach((c) => {
                    if(!c.visible)
                        hidden.push(c.text);
                });
                options.hidden = hidden;
                options.filters = (this.userOptions.filters != null) ? this.userOptions.filters : this.options.filters;
            } else {
                options.hidden = (options.hidden == null) ? [] : options.hidden;
                options.filters = (options.filters == null) ? [] : options.filters;
            }
            options.selectable = (options.selectable == null) ? true : options.selectable;
            options.deletable = (options.deletable == null) ? false : options.deletable;
            options.settings = (options.settings == null) ? true : options.settings;
            options.readonly = (options.readonly == null) ? false : options.readonly;
            options.sort = (options.sort == null) ? this.sort : options.sort;
            options.asc = (options.asc == null) ? this.asc : options.asc;
            return options;
        },
        queryString() 
        {
            console.log("Compute QueryString For: " + this.id);
            let sort = '';
            if(this.sort != null && this.asc != null) 
            {
                sort = '&sort=' + this.sort + '&asc=' + this.asc;
            };

            let filters = '&filters=';

            let jsonFilters = this.headers.filter((h) => { return h.filter.value != null && h.filter.value != "" }).map((h) => 
            {
                if(h.filter.value != null && h.filter.value != "") {
                    h.filter.property = h.text;
                    return h.filter;
                }
            });
            if(jsonFilters.length > 0) 
            {
                //this.skip = 0;
                filters += encodeURIComponent(JSON.stringify(jsonFilters));
            };

            if(parseInt(this.visibleRows) != Number.MAX_SAFE_INTEGER) {
                let rows = parseInt(this.visibleRows),
                    take = rows + Math.ceil(rows / 2);
                return 'take=' + take + '&skip=' + this.skip + sort + filters;
            } else {
                return sort + filters;
            }
            return '';
        },
        selectedRows() 
        {
            return this.rows.filter((r) => { return r.selected });
        },
        visibleRows() 
        {
            return (this.defaultOptions.take == null) ? Number.MAX_SAFE_INTEGER : this.defaultOptions.take;
        },
        allRowsSelected() 
        {
            return this.rows.some((r) => { return r.selected === true });
        },
        visibleColumns() 
        {
            return this.headers.filter((c) => { return c.visible });
        },
        inVisibleColumns() 
        {
            let array = [],
                headers = this.headers.filter((c) => { return !c.visible });
            headers.forEach((h) => { return array.push(h.text) });
            console.log("Computed Invisible Columns: " + JSON.stringify(array));
            return array;
        },
        dirtyRows() {
            return this.rows.filter((r) => { 
                return r.columns.some((c) => { return c.isDirty });
            });
        },
        isDirty() {
            return (this.dirtyRows.length > 0) ? true : false;
        },
        hasData() {
            return (this.rows.length > 0) ? true : false;
        }
    }
}
</script>
<style scoped lang="scss">
table {
    font-size: 10px;
}
.table-data-grid {
    min-height: 215px;
}
thead {
    background-color: #fff;
}
.table-responsive {
    display: inline-block;
    width: calc(100% - 50px);
    //overflow:hidden;
}
.table-responsive.show-settings {
    width: 100%;
}
.icon:hover {
    cursor: pointer;
}

.form-control-plaintext {
    padding:0;
}


.right {
    float: right;
}
.ellipsis { 
  text-overflow: ellipsis;
  overflow: hidden; 
  width: calc(100% - 31px); 
  white-space: nowrap;
  display: inline-block;
}

.box {
    position: relative;
    clear: both;
    padding: 0;
    min-height: 100%;
    height: 75vh;
    width: calc(100% - 50px);
    display: inline-block;
    margin-left: auto;
    margin-right: auto;
    /*overflow: hidden;*/
}

</style>