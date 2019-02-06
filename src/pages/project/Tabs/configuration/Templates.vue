<template>
    <div class="tab-pane fade show" :id="this.tab.id" role="tabpanel">
        <div class="form-group">
            <label>Select a template</label>
            <select class="form-control" v-model="documentId">
                <option :key="doc.id" :value="doc.id" v-for="doc in documents">{{doc.name}}</option>
            </select>
        </div>
        <div class="form-group" v-if="documentId != null">
            <label>Upload template</label>
            <div class="input-group">
                <div class="custom-file">
                    <input class="form-control" type="file" id="inputGroupFile04" placeholder="Please select a template..." @change="setUploadFile" />
                    <label class="custom-file-label" for="inputGroupFile04">{{uploadFileName}}</label>
                </div>
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button" id="inputGroupFileAddon04" @click="uploadTemplate">Upload</button>
                </div>
            </div>
        </div>
        <hr>
        <loader :loading="loading"></loader>
        <div class="row" v-if="documentId != null && template != null">
            <div class="col-10">
                <h4>
                    Template
                    <button class="btn btn-outline-leeuwen-blue btn-sm" @click="downloadExample">
                        <v-icon name="download"></v-icon> Example
                    </button>
                </h4>
                
                <div class="scrollable table-responsive">
                    <table class="table table-bordered text-center table-sm" v-if="template.templateRows.length > 0">
                        <thead>
                            <tr class="table-active">
                                <th></th>
                                <th class="header" :key="index" v-for="(r, index) in template.templateRows[0].templateColumns">{{alfabet[index]}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr :key="rowIndex" v-for="(r, rowIndex) in template.templateRows" :class="{ 'repeat': r.repeat }">
                                <td class="table-active" @click="setRepeat(r)" >
                                    <span>{{rowIndex + 1}}</span>
                                    <v-icon name="clone" v-if="r.repeat"></v-icon>
                                </td>
                                <draggable 
                                    :options="{group: 'cells'}" 
                                    :id="rowIndex + '_' + colIndex" 
                                    :ref="rowIndex + '_' + colIndex" 
                                    :key="colIndex" v-for="(c, colIndex) in r.templateColumns" 
                                    :element="'td'"
                                    :class="{ 'dropzone': drag }"
                                    :title="alfabet[colIndex] + ':' + (rowIndex + 1)">
                                        <span v-if="!!c.label && !c.label.startsWith('{{') && !c.label.endsWith('}}')" :class="{ 'red bold': c.isDirty}">{{c.label}}</span>
                                        <span v-else-if="c.label.startsWith('{{') && c.label.endsWith('}}')" :class="{ 'red bold': c.isDirty}">
                                            {{$t(c.label)}}
                                            <button type="button" class="close" @click="clearInput(c)">
                                                <span>&times;</span>
                                            </button>
                                        </span>
                                        <span v-else >{{alfabet[colIndex] + ':' + (rowIndex + 1)}}</span>
                                </draggable>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-2">
                <h4>Fields</h4>
                <div class="form-group">
                    <label>Search</label>
                    <input class="form-control" v-model="filter"/>
                </div>
                <draggable class="list-group" @start="drag=true" @end="onEnd" :options="options">
                    <button type="button" class="list-group-item list-group-item-action ellipsis" v-for="(el, index) in filteredProperties" :key="index" :label="el.name">
                        {{$t(el.name)}}<br>
                        <small>{{el.name}}</small>
                    </button>
                </draggable>
            </div>
        </div>
    </div>
</template>

<script>
    import Draggable from 'vuedraggable'
    import Loader from '@/components/Loader'
    export default {
        name: '',
        props: ['tab'],
        components: {
            'draggable': Draggable,
            'loader': Loader
        },
        data() {
            return {
                drag: false,
                options: {
                    group: {
                        name: 'cells',
                        pull: 'clone',
                        put: false
                    }
                },
                filter: '',
                documentId: null,
                documents: [],
                properties: [],
                uploadFile: null,
                uploadFileName: "Please select a template...",
                rows: 10,
                columns: 10,
                alfabet: [],
                template: null,
                loading: false
            }
        },
        created() {
            this.getDocuments();
            for (let i = 0; i < 26; i++) {
                this.alfabet.push((i + 10).toString(36).toUpperCase())
                //console.log((i + 10).toString(36).toUpperCase());
            }
            for(let a = 0; a < 5; a++) {
                for (let i = 0; i < 26; i++) {
                    this.alfabet.push((i + 10).toString(36).toUpperCase())
                    //console.log((a + 10).toString(36).toUpperCase() + (i + 10).toString(36).toUpperCase());
                }
            }
        },
        methods: {
            getComponentData(a, b, c) {
                console.log(a);
            },
            onEnd(ev) {
                this.drag = false;
                ev.item.remove();

                const row = ev.to.id.split('_')[0],
                      col = ev.to.id.split('_')[1],
                      column = this.template.templateRows[row].templateColumns[col];

                if(!column.label 
                || (column.label.startsWith("{{") && column.label.endsWith("}}"))) {
                    column.label = '{{' + ev.clone.querySelector("small").innerText + '}}';
                    column.isDirty = true;
                    this.saveColumn(column);
                }
            },
            clearInput(column) {
                column.label = '';
                column.isDirty = true;
                this.saveColumn(column);
            },
            getDocuments() {
                this.loading = true;
                return this.$http.get("api/Templates/Documents").then((res) => {
                    this.loading = false;
                    return this.documents = res.data;
                });
            },
            getTemplate() {
                this.loading = true;
                return this.$http.get('api/Templates/Template/' + this.$route.params.projectId + '/' + this.documentId).then((res) => {
                    if(res.data == null || res.data == "")
                    {
                        this.template = null;
                        this.uploadFileName = "Please select a template...";
                        return;
                    };

                    res.data.templateRows = res.data.templateRows.sort((a, b) => { return a.index - b.index });
                    res.data.templateRows.forEach((c) => {
                        c.templateColumns = c.templateColumns.sort((a,b) => { return a.index - b.index });
                    });
                    this.template = res.data;
                    this.uploadFileName = res.data.fileName;
                    this.loading = false;
                })
            },
            downloadExample() {
                this.loading = true;
                return this.$http.get('api/Templates/Example/' + this.$route.params.projectId + '/' + this.documentId, { responseType: 'blob' }).then((res) => {
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
                    this.loading = false;
                });
            },
            getProperties() {
                this.loading = true;
                return this.$http.get('api/Templates/Properties?entities=' + this.document.entities).then((res) => {
                    this.loading = false;
                    return this.properties = res.data;
                });
            },
            setRepeat(row) {
                row.repeat = (row.repeat) ? false : true;
                row.isDirty = true;
                this.saveRow(row);
            },
            setUploadFile(ev) {
                this.uploadResults = null;
                this.uploadFile = ev.currentTarget.files[0];
                this.uploadFileName = this.uploadFile.name;
            },
            saveColumn(col) {
                if(col.isDirty && (!col.label || (col.label.startsWith("{{") && col.label.endsWith("}}"))))
                {
                    this.$http.post('api/Templates/SaveColumns/', [col]).then((res) => {
                        const value = col.label;
                        col.label = '';
                        col.label = value;
                        col.isDirty = false;
                    });
                }
            },
            saveRow(row) {
                this.$http.post('api/Templates/SaveRows/', [row]).then((res) => {
                    row.isDirty = false;
                    this.loading = false;
                });
            },
            /*
            saveTemplate() {
                this.loading = true;
                let rows = this.template.templateRows.filter((r) => { return r.templateColumns.some((c) => { return c.isDirty == true })});
                let columns = [];
                
                rows.forEach((r) => {
                    const dirtyColumns = r.templateColumns.filter((c) => { return c.isDirty == true });
                    dirtyColumns.forEach((c) => {
                        columns.push(c);
                    })
                });
                
                if(columns.length > 0) 
                {
                    this.$http.post('api/Templates/SaveColumns/', columns).then((res) => {
                        columns.forEach((c) => {
                            c.isDirty = false;
                        });
                    });
                };

                rows = this.template.templateRows.filter((r) => { return r.isDirty == true });
                if(rows.length > 0) 
                {
                    this.$http.post('api/Templates/SaveRows/', rows).then((res) => {
                        rows.forEach((c) => {
                            c.isDirty = false;
                            this.loading = false;
                        });
                    });
                };
            },
            */
            uploadTemplate() {
                const file = this.uploadFile;
                if(file == null)
                    return;

                if(file.size > 4000000)
                {
                    return alert('File is too large. Max of 4MB is allowed.');
                }
                
                const ext = file.name.split(".")[file.name.split(".").length - 1],
                    extensions = ['xlsx'];

                if(extensions.indexOf(ext) < 0)
                {
                    return alert('File not allowed. Only file extensions ' + extensions.join() + ' are allowed.');
                }

                this.loading = true;
                const formData = new FormData();
                formData.append('file', file);

                return this.$http.post('api/Templates/Upload/' + this.$route.params.projectId + "/" + this.documentId, formData).then((res) => {
                    this.template = res.data;
                    this.loading = false;
                })
                .catch((res) => {
                    this.loading = false;
                    alert("Upload failed.");
                });
            }
        },
        computed: {
            document() {
                return this.documents.find((d) => { return d.id == this.documentId});
            },
            filteredProperties() {
                return this.properties.filter((c) => { return this.$t(c.name).toLowerCase().indexOf(this.filter.toLowerCase()) >= 0 || c.name.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0 });
            }
        },
        watch: {
            documentId(to, from) {
                this.getTemplate();
                this.getProperties();
            }
        }
    }
</script>

<style scoped>
.dropzone {
    background-color: lightyellow;
    color: black;
}
.bold {
    font-weight: bold;
}
.repeat {
    background-color:#1658a6;
    color:white;
}
.scrollable {
    max-height: 500px;
}
</style>