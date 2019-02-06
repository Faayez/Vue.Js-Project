<template>
    <div class="tab-pane fade show" :id="this.tab.id" role="tabpanel">
        <div class="alert alert-primary" role="alert">
            <h4 class="alert-heading">Set User Defined Fields</h4>
            <p>Here you can define which user defined fields you want to show on the screen and/or in the DUF. Please select the entity you want to set first.</p>
        </div>
        <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">Select Entity:</span>
            </div>
            <select class="form-control" v-model="entity" @change="getUserDefinedFields">
                <option value="ProjectOrderLine">ProjectOrderLine</option>
                <option value="Expediting">Expediting</option>
                <option value="Inspection">Inspection</option>
                <option value="Shipping">Shipping</option>
            </select>
        </div>
        <div v-if="fields.length > 0">
            <hr>
            <h3>{{entity}}</h3>
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>DB Name</th>
                        <th>Translation</th>
                        <th hidden>On Screen</th>
                        <th v-if="inDuf">In DUF</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :key="field.index" v-for="field in fields">
                        <td>{{field.field}}</td>
                        <td>{{field.field}}</td>
                        <td hidden><checkbox :object="field" :check="field.onScreen" property="onScreen" size="1.5" v-on:toggle="toggle"></checkbox></td>
                        <td v-if="inDuf"><checkbox :object="field" :check="field.inDuf" property="inDuf" size="1.5" v-on:toggle="toggle"></checkbox></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import CheckBox from '@/components/CheckBox'
    export default {
        name: '',
        props: ['tab'],
        components: {
            'checkbox': CheckBox
        },
        data() {
            return {
                entity: null,
                fields: []
            }
        },
        methods: {
            getUserDefinedFields() {
                this.fields = [];
                return this.$http.get('api/UserDefinedFields/GetByEntityName/' + this.projectId + '/' + this.entity).then((res) =>{
                    this.fields = res.data;
                })
            },
            toggle(field, property, value) {
                let index = this.fields.indexOf(field),
                    f = this.fields[index],
                    isNew = (!f.inDuf && !f.onScreen) ? true : false;
                
                this.$set(f, property, value);
                //f[property] = value;

                if(f.onScreen == false && f.inDuf == false) {
                    return this.$http.delete('api/UserDefinedFields/' + f.id);
                } else if(!isNew) {
                    return this.$http.put('api/UserDefinedFields/' + f.id, f);
                } else {
                    return this.$http.post('api/UserDefinedFields', f).then((res) => { 
                        return f.id = res.data.id 
                    });
                }
            },
        },
        computed: {
            projectId() {
                return this.$route.params.projectId;
            },
            inDuf() {
                if(this.entity == "Expediting" || this.entity == "ProjectOrderLine") 
                {
                    return true;
                }
                return false;
            }
        }
    }
</script>

<style scoped>
</style>