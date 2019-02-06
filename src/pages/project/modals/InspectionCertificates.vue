<template>
    <modal id="inspectionCertificatesModal" ref="inspectionCertificatesModal" >
        <template slot="title">Certificates</template>
        <template slot="body">
            <form ref="fileform" class="text-center" id="dropzone">
                <span class="drop-files">Drag and drop your files here!</span>
                <input type="file" class="input-file" @change="uploadFile($event.currentTarget.files[0])" hidden />
            </form>
            <hr>
            <div class="js-upload-finished" v-if="certificates.length > 0">
                <h3>Certificates</h3>
                <div class="list-group" >
                    <div class="list-group-item list-group-item-action flex-column align-items-start" v-for="cert in certificates" :key="cert.id">
                        <div class="d-flex w-100 justify-content-between" @click="downloadFile(cert)">
                            <h5 class="mb-1">{{cert.fileName}}</h5>
                            <small class="">{{$d(cert.createdDate, 'long')}}</small>
                        </div>
                        <p class="mb-1 badge badge-info">{{(cert.fileSize / 1024).toFixed()}} kb</p>
                        <small class="red" @click="removeFile(cert)">remove</small>
                    </div>

                </div>
            </div>
        </template>
        <template slot="buttons">
            <button class="btn btn-outline-leeuwen" v-if="certificates.length > 0" @click="downloadAll">
                <v-icon name="download"></v-icon> Download All
            </button>
        </template>
    </modal>
</template>

<script>
import Vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import Modal from '@/components/Modal';
export default {
    props: ['inspectionId'],
    components: {
        'modal': Modal,
        'vue-dropzone': Vue2Dropzone
    },
    data() {
        return {
            dropzoneOptions: {
                url: 'api/Certificates/UploadByInspectionId/' + this.inspectionId,
                thumbnailWidth: 150,
                maxFilesize: 4,
                headers: { "My-Awesome-Header": "header value" },
                dictDefaultMessage: "<v-icon name='upload'></v-icon> Just click or drag and drop files here..."
            },
            certificates: [],
            isUploading: false,
            isUploadingPercentage: 0,
            //inspectionId: null
        }
    },
    mounted() {
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( function( evt ) {
            this.$refs.fileform.addEventListener(evt, function(e){
                e.preventDefault();
                e.stopPropagation();
            }.bind(this), false);
        }.bind(this));

        this.$refs.fileform.addEventListener('dragover', function(e){
            this.$refs.fileform.classList.add("dragover");
        }.bind(this));

        this.$refs.fileform.addEventListener('dragleave', function(e){
            this.$refs.fileform.classList.remove("dragover");
        }.bind(this));

        this.$refs.fileform.addEventListener('drop', function(e){
            this.$refs.fileform.classList.remove("dragover");
            for( let i = 0; i < e.dataTransfer.files.length; i++ ){
                this.uploadFile(e.dataTransfer.files[i]);
            }
        }.bind(this));

        this.$refs.fileform.addEventListener('click', function (e) {
            e.currentTarget.querySelector('input').click();
        });

        this.$http.get('api/Certificates/GetCertificatesByInpsectionId/' + this.inspectionId).then((res) => {
            this.certificates = res.data.map((c) => { c.createdDate = new Date(c.createDate); return c; });
        });
    },
    methods: {
        uploadFile(file) {
            if(file.size > 4000000)
            {
                return alert('File is too large. Max of 4MB is allowed.');
            }
            
            const ext = file.name.split(".")[file.name.split(".").length - 1],
                extensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'tiff', 'doc', 'xdoc', 'xls', 'csv', 'xlsx'];

            if(extensions.indexOf(ext) < 0)
            {
                return alert('File not allowed. Only file extensions ' + extensions.join() + ' are allowed.');
            }

            const formData = new FormData();
            formData.append('file', file);

            return this.$http.post('api/Certificates/UploadByInspectionId/' + this.inspectionId, formData).then((res) => {
                    res.data.createdDate = new Date(res.data.createDate);
                    this.certificates.push(res.data);
                })
            .catch((res) => {
            });
        },
        downloadFile(cert) {
            return this.$http.get('api/Certificates/' + cert.id, { responseType: 'blob' }).then((res) => {
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
            });
        },
        removeFile(cert) 
        {
            return this.$http.delete('api/Certificates/' + cert.id).then((res) => {
                this.certificates.splice(this.certificates.indexOf(cert), 1);
            });
        },
        downloadAll()
        {
            return this.$http.get('api/Certificates/DownloadAll/' + this.inspectionId, { responseType: 'blob' }).then((res) => {
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
            });
        }
    },
    computed: {
    }
}
</script>

<style scoped>

#dropzone {
    background-color: #fff;
    min-height: 80px;
    border: 4px dashed rgba(0,0,0,0.3);
    padding: 20px 20px;
    position:relative;
}
#dropzone.dragover {
    border-style: solid;
}

#dropzone span {
    font-size: 24px;
    color:  rgba(0,0,0,0.3);
    font-weight: bold;
}

.list-group-item:hover {
    cursor:pointer;
}
</style>