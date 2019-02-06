<template>
    <div id="duf">
            <h2>Upload DUF</h2>
            <div class="form-group">
                <file-input :get="'api/Duf/' + projectId" :set="'api/Duf/' + projectId" v-on:response="setResults"></file-input>
            </div>
            
            <div class="form-group table-resonsive" v-if="uploadResults != null">
                <strong>Total Processed:</strong> {{uploadResults.total}}<br>
                <strong>Total Records New:</strong> {{uploadResults.new}}<br>
                <strong>Total Records Update:</strong> {{uploadResults.update}}<br>
                <strong>Total Success:</strong> {{uploadResults.success}}<br>
                <strong>Total Errors:</strong> {{uploadResults.errors}}<br>
                <hr>
                <div v-if="uploadResults.success > 0">
                    <h3>Success</h3>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Row</th>
                                <th>Success Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr :key="row.index" v-for="row in uploadResults.successMessages" class="table-success">
                                <td>{{row.rowId}}</td>
                                <td>{{row.message}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="uploadResults.errors > 0">
                    <h3>Errors</h3>
                    <table class="table table-sm" >
                        <thead>
                            <tr>
                                <th>Row</th>
                                <th>Error Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr :key="row.index" v-for="row in uploadResults.errorMessages" class="table-danger">
                                <td>{{row.rowId}}</td>
                                <td>{{row.message}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
    </div>
</template>
<script>
import FileInput from '@/components/FileInput'
export default {
    name: 'duf',
    props: [],
    components: {
        'file-input': FileInput
    },
    data () {
        return {
            uploadFile: null,
            uploadFileName: "Choose DUF file",
            uploadResults: null,
            uploading: false
        }
    },
    mounted() {
    },
    methods: {
        setResults(results) {
            this.uploadResults = results;
        }
    },
    computed: {
        projectId() {
            return this.$route.params.projectId;
        },
    }
}
</script>
<style scoped>
</style>