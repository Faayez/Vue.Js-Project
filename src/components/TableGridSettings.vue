<template>
    <div class="table-settings text-right">
        <button type="button" class="btn btn-outline-leeuwen-blue mb-1" data-toggle="modal" :data-target="'#' + id + '_col_modal'" title="Table Settings">
            <v-icon name="cog"></v-icon>
        </button>
        <button type="button" class="btn btn-outline-leeuwen-blue mb-1" @click="showFilter" title="Show Filters">
            <v-icon name="filter"></v-icon>
        </button>
        <button type="button" class="btn btn-outline-leeuwen-blue mb-1" @click="initLoad" title="Reload Table">
            <v-icon name="sync-alt"></v-icon>
        </button>
        <!--<button type="button" class="btn btn-outline-leeuwen-blue mb-1" @click="loadAll" title="Load All Records">
            <v-icon name="table"></v-icon>
        </button>-->
        <button class="btn btn-outline-leeuwen-blue mb-1" @click="unlock"  v-if="(roles.indexOf('Admin') >= 0 || roles.indexOf('Expediter') >= 0) && !!this.$parent.defaultOptions.saveApi">
            <v-icon name="lock" v-if="isLocked"></v-icon>
            <v-icon name="unlock" v-if="!isLocked"></v-icon>
        </button>
        <button type="button" class="btn btn-outline-leeuwen-blue mb-1" title="Download to Excel" @click="download">
            <v-icon name="download"></v-icon>
        </button>
        <button type="button" class="btn btn-outline-leeuwen-blue mb-1" title="Upload from Excel" data-toggle="modal" :data-target="'#' + id + '_upload_modal'" v-if="bulkupload == true">
            <v-icon name="upload"></v-icon>
        </button>
        <button type="button" class="btn btn-outline-success" title="Save Changes" v-if="isDirty" @click="saveChanges">
            <v-icon name="save"></v-icon>
        </button>
        <div v-if="loading">
            <img src="@/assets/loader.gif" title="loading" width="40" />
        </div>

        <modal :id="id + '_col_modal'" :save="saveUserOptions">
            <template slot="title">Grid Settings</template>
            <template slot="body">
                <ul class="nav nav-tabs" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active" data-toggle="tab" :href="'#table_general_' + id">General</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-toggle="tab" :href="'#table_columns_' + id">Columns</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-toggle="tab" :href="'#table_filters_' + id">Filters</a>
                    </li>
                </ul>
                <div class="tab-content nav">
                    <div class="tab-pane fade show active text-left" :id="'table_general_' + id" role="tabpanel" style="width: 100%" >
                        <strong>Grid ID: </strong><span>{{id}}</span>
                    </div>
                    <div class="tab-pane fade show" :id="'table_columns_' + id" role="tabpanel" style="width: 100%" >
                        <div class="row" v-for="i in Math.ceil($parent.headers.length / 4)" :key="i">
                            <div class="col-md-3 text-left" v-for="header in $parent.headers.slice((i - 1) * 4, i * 4)" :key="header.id">
                                <div class="form-group form-check">
                                    <input type="checkbox" class="form-check-input" v-model="header.visible">
                                    <label class="form-check-label" for="exampleCheck1">{{$t(header.text)}}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade text-left" :id="'table_filters_' + id" role="tabpanel"  style="width: 100%">
                        <div class="row" v-for="i in Math.ceil($parent.headers.length / 3)" :key="i">
                            <div class="col-md-4" v-for="header in $parent.headers.slice((i - 1) * 3, i * 3)" :key="header.id">
                                <div class="form-group row">
                                    <label :for="header.id + '_filter_header'" class="col-sm-6 col-form-label ellipsis" :title="$t(header.text)">{{$t(header.text)}}</label>
                                    <div class="col-sm-6">
                                        <div class="input-group input-group-sm" :id="header.id + '_filter_header'">
                                            <input class="form-control tight" v-model="header.filter.value" >
                                            <div class="input-group-append">
                                                <button class="btn btn-outline-leeuwen-blue" type="button" id="button-addon2" @click="toggleFilter(header.filter)">
                                                    <v-icon name="not-equal" v-if="!header.filter.equal"></v-icon>
                                                    <v-icon name="equals" v-if="header.filter.equal"></v-icon>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </template>
            <template slot="buttons">
                <button type="button" class="btn btn-leeuwen" @click="resetUserOptions">Reset</button>
            </template>
        </modal>
        <modal :id="id + '_upload_modal'" :showFooter="false" :isSmall="true">
            <template slot="title">Upload DUF</template>
            <template slot="body">
                <div class="form-group">
                    <div class="input-group mb-3">
                        <div class="custom-file text-left">
                            <input type="file" class="custom-file-input" @change="setUploadFile">
                            <label class="custom-file-label" for="inputGroupFile01">{{uploadFileName}}</label>
                        </div>
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary" type="button" @click="uploadingFile" >Upload</button>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-success text-left" role="alert" v-if="uploadSuccess == true">
                    <h4 class="alert-heading">Success</h4>
                    <p>The data has been updated.</p>
                </div>
                <div class="alert alert-danger text-left" role="alert" v-if="uploadSuccess == false">
                    <h4 class="alert-heading">Failed</h4>
                    <p>The data has <strong>NOT</strong> been updated.</p>
                </div>
            </template>
        </modal>
    </div>
</template>
<script>
import Modal from '@/components/Modal';
export default {
    name: 'table-grid-settings',
    props: ['loading', 'bulkupload'],
    components: {
        'modal': Modal,
    },
    data () {
        return {
            locked: [],
            isLocked: true,
            uploadFile: null,
            uploadFileName: "Choose file...",
            uploadResults: null,
            uploadSuccess: null
        }
    },
    methods: {
        lock() {
            this.$parent.rows.forEach(r => {
                return r.columns.forEach(c => {
                    return c.edit = (this.locked.findIndex((item) => { return item.text === c.label }) >= 0) ? false : true;
                })
            });
            this.locked = [];
            this.isLocked = true;
        },
        unlock() {
            if(!this.isLocked)
                return this.lock();

            this.locked = this.$parent.headers.filter((h) => {
                return !h.edit;
            });
            this.$parent.rows.forEach(r => {
                return r.columns.forEach(c => {
                    return c.edit = (c.key > 0) ? true : false;
                });
            });
            this.isLocked = false;
        },
        addRow () {
            if(!this.$parent.defaultOptions.readonly)
            {
                console.log('Add Row...');
                if(this.$parent.rows.length == 0) {
                    let cols = {};
                    this.headers.forEach((h) => {
                        if(h.text == 'id') {
                            return cols[h.text] = '-1', cols.edit = false, cols.edit = false;
                        } else {
                            return cols[h.text] = '', cols.isDirty = true;
                        }
                    });
                    let r = new row(cols, this.rows.length + 1);
                    r.isNew = true;
                    this.$parent.rows.unshift(r);
                } 
                else 
                {
                    let r = JSON.parse(JSON.stringify(this.$parent.rows[0]));
                    r.cols.forEach((c) => { 
                        if(c.propertyName == 'id') {
                            return c.text = -1, c.isDirty = true, c.edit = false;
                        } else {
                            return c.text = '', c.isDirty = true;
                        } 
                    });
                    r.id = this.$parent.rows.length + 1;
                    r.isNew = true;
                    this.$parent.rows.unshift(r);
                }
            };
        },
        initLoad() {
            this.$parent.initLoad();
        },
        loadAll() {
            this.$parent.loadAll();
        },
        saveUserOptions() {
            let options = {};
                //options.hidden = this.$parent.inVisibleColumns;
                options.asc = this.$parent.asc;
                options.sort = this.$parent.sort;
                options.headers = this.$parent.headers;
            this.$http.put("api/UserTableOptions/" + this.id, {
                TableId: this.id,
                Options: JSON.stringify(options),
                UserName: (this.$parent.userOptions != null) ? this.$parent.userOptions.UserName : null
            });
        },
        resetUserOptions() {
            this.$http.delete("api/UserTableOptions/" + this.id).then((res) => {
                this.$parent.headers.forEach((h) => { 
                    this.$parent.options.hidden.indexOf(h.text) >= 0 ? h.visible = false : h.visible = true;
                    h.filter = null;
                });
                this.$parent.userOptions = null;
                this.$parent.initLoad();
            }).catch((res) => {
                this.$parent.headers.forEach((h) => { 
                    this.$parent.options.hidden.indexOf(h.text) >= 0 ? h.visible = false : h.visible = true;
                    h.filter = null;
                });
                this.$parent.userOptions = null;
            });
        },
        saveChanges() {
            this.$parent.saveChanges();
        },
        showFilter() {
            if(this.isFilterVisisble) {
                return this.$parent.isFilterVisisble = false;
            };
            return this.$parent.isFilterVisisble = true;
        },
        setUploadFile(ev) {
            this.uploadResults = null;
            this.uploadFile = ev.currentTarget.files[0];
            this.uploadFileName = this.uploadFile.name;
        },
        uploadingFile() {
            this.$parent.isLoading = true;
            
            const formData = new FormData()
            formData.append('file', this.uploadFile);

            const url = this.$parent.options.api,
                uploadUrl = url.replace("api/Tables/GetAsync/", "api/Tables/Upload/");

            this.$http.post(uploadUrl, formData).then((res) => {
                this.uploadResults = res.data;
                this.$parent.isLoading = false;
                this.uploadSuccess = true;
                this.initLoad();
            }).catch((err) => {
                this.$parent.isLoading = false;
                this.uploadSuccess = false;
            });
        },
        download() 
        {
            this.$parent.isLoading = true;
            const process = this.id.split("_")[this.id.split("_").length - 1];
            let idArray = "";
            let array = [];
            this.$parent.selectedRows.forEach((r) => { 
                const col = r.columns.find((c) => { return c.label.toLowerCase() == process + "_id"});
                if(col != null)
                {
                    if(array.indexOf(col.value) < 0)
                    {
                        array.push(col.value);
                        idArray += "id=" + col.value + "&";
                    }
                }
            });

            const hasParams = (this.$parent.options.api.split("?").length > 1) ? '&' : '?',
                        url = this.$parent.options.api + hasParams + this.$parent.queryString;
            const downloadUrl = url.replace("api/Tables/GetAsync/", "api/Tables/Download/");

            this.$http.get(downloadUrl, { responseType: 'blob' }).then((res) =>
            {
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
                this.$parent.isLoading = false;
            }).catch((err) => {
                this.$parent.isLoading = false;
            })
        },
        upload()
        {

        },
        downloadTo(type) {
            this.$http.get('api/Tables/Download/' + this.projectId + '/' + this.id + '?type=' + type, { responseType: 'blob' }).then((res) => {
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
            })
        },
        toggleFilter(filter) {
            if(filter.equal) {
                return filter.equal = false;
            }
            return filter.equal = true;
        }
    },
    computed: {
        id() {
            return this.$parent.id;
        },
        projectId() {
            return this.$route.params.projectId;
        },
        isDirty() {
            return this.$parent.isDirty;
        },
        isFilterVisisble() {
            return this.$parent.isFilterVisisble;
        },
        disableDownloadBtn() {
            return (this.$parent.selectedRows.length == 0) ? true : false;
        },
        roles() {
            return this.$store.getters.roles;
        }
    }
}
</script>
<style scoped>
.btn {
    min-width: 42px;
}
.table-settings {
    width: 50px;
    float: right;
}

</style>
