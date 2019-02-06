<template>
    <modal id="shippingDocumentsModal" ref="shippingDocumentsModal" :showFooter="false" :isSmall="true">
        <template slot="title">Documents</template>
        <template slot="body">
            <div  class="text-center">
                    <div class="btn-group">
                        <button class="btn btn-outline-leeuwen-blue" @click="downloadFile('packinglist')">
                            <v-icon name="file-excel" scale="2"></v-icon><br>
                            <strong>Packing List</strong>
                        </button>
                        <button class="btn btn-outline-leeuwen-blue" @click="downloadFile('shippinginvoice')">
                            <v-icon name="file-excel" scale="2"></v-icon><br>
                            <strong>Shipping Invoice</strong>
                        </button>
                    </div>
                    <hr>
                    <div>
                        <checkbox :showLabel="true" :check="duplicate" label="Duplicate" v-on:toggle="setDuplicate" :size="2"></checkbox>
                    </diV>
                </div>
        </template>
    </modal>
</template>

<script>
import Modal from '@/components/Modal';
import CheckBox from '@/components/CheckBox';
export default {
    props: ['packingListNo'],
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
            const query = (this.duplicate) ? '?duplicate=true' : '';
            switch(type) {
                case 'packinglist':
                    promise = this.$http.post('api/Templates/Document/'+ this.$route.params.projectId + '/4' + query, [this.packingListNo], { responseType: 'blob' });
                    break;
                case 'shippinginvoice':
                    promise = this.$http.post('api/Templates/Document/'+ this.$route.params.projectId + '/5' + query, [this.packingListNo], { responseType: 'blob' });
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
    }
}
</script>

<style scoped>

</style>