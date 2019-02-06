<template>
    <div class="tableHeaders">
        <tr v-if="headers != null">
            <th @click="selectAllRows" class="selectCol text-center" v-if="headers.length > 0 && options.selectable">
                <v-icon name="check-double" v-bind:class="[allRowsSelected ? 'checked' : 'unchecked']" v-if="options.multiple"></v-icon>
            </th>
            <th :key="header.id" v-for="header in headers" v-if="header.visible">
                <span class="right">
                    <span class="icon" @click="hideField(header)" title="hide">
                        <v-icon name="eye-slash" ></v-icon>
                    </span>
                    <span v-if="header.text === sort" class="icon">
                        <span @click="sortField(header, false)"  v-if="asc" title="sort ASC">
                            <v-icon name="caret-down"></v-icon>
                        </span>
                        <span @click="sortField(header, true)"  v-if="!asc"  title="sort DESC"> 
                            <v-icon name="caret-up"></v-icon>
                        </span>
                    </span>
                    <span v-if="header.text !== sort" class="icon" @click="sortField(header, true)" title="sort">
                        <v-icon name="sort" ></v-icon>
                    </span>
                </span>
                <span :title="$t(header.text)" class="nowrap th-title">
                {{ $t(header.text) }}
                </span>
            </th>
            <th class="removeCol text-center" :class="{ 'hidden-header': headers.length == 0}" v-if="options.deletable || headers.length == 0">
            </th>
        </tr>
        <tr v-show="filter">
            <th class="selectCol text-center" v-if="headers.length > 0 && options.selectable">
            </th>
            <th :key="header.id" v-for="header in headers" v-if="header.visible">
                <div class="input-group input-group-sm">
                    
                    <select class="form-control tight" v-model="header.filter.value" v-if="header.type == 'boolean'">
                        <option value="1">True</option>
                        <option value="0">False</option>
                    </select>
                    <input class="form-control tight" :type="header.type" v-model="header.filter.value" v-else>
                    
                    <div class="input-group-append">
                        <button class="btn btn-outline-leeuwen-blue" type="button" id="button-addon2" @click="toggleFilter(header.filter)">
                            <v-icon name="not-equal" v-if="!header.filter.equal"></v-icon>
                            <v-icon name="equals" v-if="header.filter.equal"></v-icon>
                        </button>
                    </div>
                </div>
            </th>
            <th class="removeCol text-center" :class="{ 'hidden-header': headers.length == 0}" v-if="options.deletable || headers.length == 0">
            </th>
        </tr>
    </div>
</template>
<script>
export default {
    name: 'table-grid-header',
    props: ['options', 'headers', 'filter'],
    data () {
        return {
            allRowsSelected: false,
            asc: true,
            sort: null
        }
    },
    mounted() {
    },
    updated() {
        const events = ['mousedown', 'mousemove', 'mouseup'],
            tables = document.querySelectorAll('.scrollable-table');

        tables.forEach((table) => {
            const th = table.querySelectorAll(".tableHeaders tr:first-child th");

            th.forEach((t) => {
                /*t.addEventListener('mouseover', (e) => {
                    debugger;
                });*/
                events.forEach( function( evt ) {
                    t.addEventListener(evt, function(e){
                        e.preventDefault();
                        e.stopPropagation();
                    }.bind(this), false);
                }.bind(this));

                var pressed = false;
                var start = undefined;
                var startX, startWidth;

                t.addEventListener('mousedown', (e) => {
                    start = e;
                    pressed = true;
                    startX = e.pageX;
                    startWidth = e.currentTarget.offsetWidth;
                    e.currentTarget.classList.add("resizing");
                });

                t.addEventListener('mousemove', (e) => {
                    if(pressed) {
                        const width = startWidth+(e.pageX-startX),
                            offsetWidth = e.currentTarget.offsetWidth,
                            index = Array.prototype.indexOf.call(th, t) + 1,
                            td = table.querySelectorAll('tbody tr td:nth-child(' + index + ')');
                        //console.log(e.currentTarget.clientWidth +  '|' + e.currentTarget.offsetWidth)
                        
                        e.currentTarget.style.minWidth = width + 'px';
                        e.currentTarget.style.width = width + 'px';
                        e.currentTarget.style.maxWidth = width + 'px';

                        td.forEach((d) => {
                            d.style.maxWidth = width + 'px';
                            d.style.width = width + 'px';
                            d.style.minWidth = width + 'px';
                        });
                    }
                });
                
                t.addEventListener('mouseleave', (e) => {
                    if(pressed) {
                        e.currentTarget.classList.remove("resizing");
                        pressed = false;
                    }
                });

                t.addEventListener('mouseup', (e) => {
                    if(pressed) {
                        e.currentTarget.classList.remove("resizing");
                        pressed = false;
                    }
                });
            });
        });
    },
    methods: {
        toggleFilter(filter) {
            if(filter.equal) {
                return filter.equal = false;
            }
            return filter.equal = true;
        },
        sortField (header, asc) 
        {
            this.asc = asc;
            this.sort = header.text;
            this.$emit('sort', header.text, asc);
            /*
            if(asc != null) 
            {
                this.$parent.asc = asc;
            }
            this.$parent.sort = header.text;
            this.$parent.skip = 0;
            */
        },
        hideField(header) {
            this.headers.filter((h) => {
                return h.text == header.text;
            }).forEach((h) => { return h.visible = false; });
        },
        selectAllRows () 
        {
            this.$emit('selectAll');
            if(this.allRowsSelected) {
                this.allRowsSelected = false;
            } else {
                this.allRowsSelected = true;
            }
        },
    },
    computed: {
    },
    watch: {
    }
}
</script>
<style scoped>
/*
th span {
    vertical-align: bottom;
}
th:not(.selectCol)
{
    min-width: 60px;
}
.selectCol, .removeCol {
    width: 35px;
    max-width: 35px;
}
.checked {
    color: black;
}
.unchecked {
    color: lightgray;
}
.hidden-header {
    visibility: hidden;
    border-bottom: 1px solid #dee2e6;
}
.icon {
    opacity: .5;
}
.icon:hover {
    cursor: pointer;
    opacity: 1;
}
.tight {
    padding: 0;
}
*/


.icon {
    opacity: .5;
}
.icon:hover {
    cursor: pointer;
    opacity: 1;
}

.checked {
    color: black;
}
.unchecked {
    color: lightgray;
}
.right {
    float: right;
}
.nowrap {
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    width: calc(100% - 30px); 
}
.ellipsis { 
  text-overflow: ellipsis;
  overflow: hidden; 
  width: calc(100% - 35px); 
  white-space: nowrap;
  display: inline-block;
}
th span.ellipsis {
    cursor:col-resize;
}
</style>
