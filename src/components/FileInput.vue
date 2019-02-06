<template>
    <div class="input-group mb-3">
        <div class="custom-file">
            <input type="file" class="custom-file-input" @change="setUploadFile" id="upload-file-input" :disabled="uploading" >
            <label class="custom-file-label" for="inputGroupFile01" >{{uploadFileName}}</label>
        </div>
        <div class="input-group-append">
            <button class="btn btn-leeuwen" type="button" @click="clearUploadFile" v-if="!disableClearBtn" :disabled="uploading">
                <v-icon name="trash-alt"></v-icon>
            </button>
            <button class="btn btn-outline-secondary" type="button" @click="startUploadFile" v-if="!disableClearBtn || !get" :disabled="uploading">
                <v-icon name="spinner" spin v-if="uploading"></v-icon><v-icon name="upload" v-if="!uploading"></v-icon> Upload                             
            </button>
            <button class="btn btn-outline-secondary" type="button" @click="getExample" v-if="disableClearBtn && !!get" :disabled="uploading">
                <v-icon name="spinner" spin v-if="uploading"></v-icon><v-icon name="download" v-if="!uploading"></v-icon> Example
            </button>
        </div>
    </div>
</template>

<script>
export default {
    props: ['get', 'set'],
    data() {
        return {
            uploading: false,
            uploadFile: null,
            uploadFileName: "Choose a file..."
        }
    },
    methods: {
        setUploadFile(ev) {
            this.uploadFile = ev.currentTarget.files[0];
            this.uploadFileName = this.uploadFile.name;
        },
        clearUploadFile() {
            document.getElementById("upload-file-input").value = "";
            this.uploadFile = null;
            this.uploadFileName = "Choose a file...";
        },
        startUploadFile() {
            this.uploading = true;
            const formData = new FormData()
            formData.append('file', this.uploadFile);
            this.$http.post(this.set, formData).then((res) => {
                this.$emit('response', res.data);
                this.uploading = false;
                this.clearUploadFile();
            }).catch((res) => {
                this.uploading = false;
            });

        },
        getExample() {
            this.uploading = true;
            this.$http.get(this.get, { responseType: 'blob' }).then((res) => {
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
                this.uploading = false;
            });
        }
    },
    computed: {
        disableClearBtn() {
            if(this.uploadFile == null)
                return true;
            return false;
        }
    }
}
</script>