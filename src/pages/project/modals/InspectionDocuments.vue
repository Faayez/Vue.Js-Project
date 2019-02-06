<template>
    <modal id="inspectionDocumentsModal" ref="inspectionDocumentsModal" :showFooter="false" :isSmall="true">
        <template slot="title">Documents</template>
        <template slot="body">
            <div  class="text-center">
                <div class="btn-group">
                    <button class="btn btn-outline-leeuwen-blue" @click="downloadFile('nfi')" :disabled="disableNfi">
                        <v-icon name="file-excel" scale="2"></v-icon><br>
                        <strong>Notification For Inspection</strong>
                    </button>
                    <button class="btn btn-outline-leeuwen-blue" @click="downloadFile('release')">
                        <v-icon name="file-excel" scale="2"></v-icon><br>
                        <strong>Inspection And Release</strong>
                    </button>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
import Modal from '@/components/Modal';
import CheckBox from '@/components/CheckBox';
export default {
    props: ['nfiNo', 'rows'],
    components: {
        'modal': Modal,
        'checkbox': CheckBox,
    },
    data() {
        return {
            duplicate: true
        }
    },
    mounted() {
        
    },
    methods: {
        setDuplicate(obj, prop, check) {
            this.duplicate = check;
        },
        downloadFile(type) {
            let promise = new Promise((resolve, reject) => { resolve() });
            let query = '';
            switch(type) {
                case 'nfi':
                    promise = this.$http.get('api/Templates/Document/' + this.$route.params.projectId + "/2" + query, [this.nfiNo], { responseType: 'blob' });
                    break;
                case 'release':
                    let rows = [];
                    this.$parent.selectedRows.forEach((r) => {
                        const col = r.columns.find((c) => { return c.label.toLowerCase() == "inspection_id" });
                        if(col != null) {
                            rows.push(col.value);
                        }
                    });
                    
                    promise = this.$http.get('api/Templates/Document/' + this.$route.params.projectId + "/3", rows, { responseType: 'blob' });
                    break;
            };

            promise.then((res) => {
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
            }).catch((err) => {
                let error = err.data;
                if(typeof(err.data) == "object")
                {
                    error = '';
                    for(let prop in err.data)
                    {
                        error += prop + ": " + err.data[prop].toString() + ", ";
                    }
                }
                alert("Failed: " + error)
            })
        }
    },
    computed: {
        disableNfi() {
            return this.$parent.selectedRows.length != 1;
        }
    }
}
</script>

<style scoped>

</style>