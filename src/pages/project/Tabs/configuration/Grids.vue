<template>
    <div class="tab-pane fade show" :id="this.tab.id" role="tabpanel">
        <div class="table-responsive">
            <table class="table table-hover table-sm table-bordered">
                <thead>
                    <tr class="text-center">
                        <th colspan="5" >
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Entity</span>
                                </div>
                                <select class="form-control" v-model="selectedEntity">
                                    <option v-for="(entity, index) in entities" :key="index">{{entity}}</option>
                                </select>
                            </div>
                        </th>
                        <th colspan="4" >
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Grid View</span>
                                </div>
                                <select class="form-control" v-model="selectedView"  @change="getFields">
                                    <option value="ProjectOrders">ProjectOrders</option>
                                    <option value="ProjectOrderLines">ProjectOrderLines</option>
                                    <option value="Expediting">Expediting</option>
                                    <option value="Esr">ESR</option>
                                    <option value="Inspection">Inspection</option>
                                    <option value="ShippingIn">ShippingIn</option>
                                    <option value="ShippingOut">ShippingOut (Warehouse)</option>
                                    <option value="GoodsReceipt">GoodsReceipt</option>
                                    <option value="Stock">Stock</option>
                                    <option value="InspectionExpediting">InspectionExpediting</option>
                                    <option value="ShippingPackages">ShippingPackages</option>
                                </select>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th>Entity</th>
                        <th>Property</th>
                        <th>Translation</th>
                        <th>Type</th>
                        <th>DUF</th>
                        <th>Order</th>
                        <th>Read</th>
                        <th>Write</th>
                        <th>Hide</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(field, index) in filteredFields" :key="index">
                        <td>
                            {{field.entity}}
                        </td>
                        <td>
                            {{field.property.split("_")[1]}}
                        </td>
                        <td>
                            {{$t(field.property)}}
                        </td>
                        <td>
                            {{field.type}}
                        </td>
                        <td class="text-center"> 
                            <checkbox :check="field.inDuf" :object="field" :property="'inDuf'" v-on:toggle="saveDuf" size="2" v-if="field.entity.toLowerCase() == 'projectorder' || field.entity.toLowerCase() == 'projectorderline' || field.entity.toLowerCase() == 'expediting'"></checkbox>
                        </td>
                        <template v-for="p in field.grid">
                            <td :key="p.index">
                                <input type="number" class="form-control text-center" v-model="p.order" @change="saveEntity(field, p.name + '_order', p.order)">
                            </td>
                            <td :key="p.index"  class="text-center" :class="{ 'table-danger': p.required }">
                                <checkbox :check="p.isRead" :object="field" :property="p.name + '_isRead'" v-on:toggle="saveEntity" v-if="!p.required" size="2"></checkbox>
                            </td>
                            <td :key="p.index"  class="text-center" :class="{ 'table-danger': p.required }"> 
                                <checkbox :check="p.isWrite" :object="field" :property="p.name + '_isWrite'" v-on:toggle="saveEntity" v-if="showWrite(field.property)" size="2"></checkbox>
                            </td>
                            <td :key="p.index"  class="text-center" :class="{ 'table-danger': p.required }"> 
                                <checkbox :check="p.isHidden" :object="field" :property="p.name + '_isHidden'" v-on:toggle="saveEntity" size="2"></checkbox>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
            <div v-if="loading" class="text-center">
                <img src="@/assets/loader.gif" title="loading" width="40" />
            </div>
        </div>
    </div>
</template>

<script>
import CheckBox from '@/components/CheckBox';
    export default {
        name: '',
        props: ['tab'],
        components: {
            'checkbox': CheckBox
        },
        data() {
            return {
                fields: [],
                selectedEntity: "Expediting",
                selectedView: "Expediting",
                loading: true
            }
        },
        mounted() {
            this.getFields()
        },
        methods: {
            getFields() {
                this.loading = true;
                this.$http.get('api/ProjectFields/' + this.projectId + "/" + this.selectedView + "/" + this.selectedEntity).then((res) => {
                    this.fields = res.data.sort(this.sort);
                    this.loading = false;
                }).catch((err) => {
                    this.loading = false;
                    alert("Could not load fields");
                })
            },
            sort(ob1, ob2) {
                if (ob1.entity > ob2.entity) {
                    return 1;
                } else if (ob1.entity < ob2.entity) { 
                    return -1;
                }

                // Else go to the 2nd item
                if (ob1.order < ob2.order) { 
                    return -1;
                } else if (ob1.order > ob2.order) {
                    return 1
                } else { // nothing to split them
                    return 0;
                }
            },
            showWrite(value) {
                return (value.split("_")[value.split("_").length - 1].toLowerCase() == 'id') ? false : true;
            },
            saveDuf(entity, property, checked) {
                const duf = 
                {
                    projectId: this.projectId,
                    entity: entity.entity,
                    property: entity.property.split('_')[1],
                    label: entity.property
                };
                entity[property] = false;
                if(checked)
                {
                    
                    this.$http.post("api/Duf/SaveProjectDuf/" + this.projectId, duf).then((res) =>
                    {
                        entity[property] = true;
                    }).catch(err)
                    {
                        alert(err.data);
                    };
                } 
                else 
                {
                    this.$http.delete("api/Duf/RemoveProjectDuf/" + duf.projectId + '/' + duf.entity + '/' + duf.property).then((res) =>
                    {
                        entity[property] = false;
                    }).catch((err) => {
                        alert(err.data);
                        entity[property] = true;
                    })
                }
            },
            saveEntity(entity, property, checked) {
                if(!entity.isRead && entity.required)
                    return;

                let copy = Object.assign({}, entity);
                if(property != null) {
                    if(property.toLowerCase() == "induf")
                    {
                        entity[property] = checked;
                        copy[property] = checked;
                    } 
                    else 
                    {
                        const grid = entity.grid.find((p) => { return p.name.toLowerCase() == property.split("_")[0].toLowerCase() });
                        grid[property.split("_")[1]] = checked;
                        copy.grid = [grid]
                    }
                } else {
                    copy.grid = [];
                }
                
                const self = this;
                return this.$http.post('api/ProjectFields/' + this.projectId, copy).then((res) => {
                    return;
                });
            }
        },
        computed: {
            projectId() {
                return this.$route.params.projectId;
            },
            sortedFields() {
                return this.fields.sort((a, b) => {
                    return (a.order < b.order) ? -1 : (a.order > b.order ? 1 : 0)
                })
            },
            filteredFields() {
                if(this.selectedEntity == null)
                    return this.fields;

                return this.fields.filter((c) => { return c.entity == this.selectedEntity });
            },
            entities() {
                const entities = this.fields.map((c) => { return c.entity });
                return entities.filter((c, v, entities) => { return entities.indexOf(c) === v });
            }
        }
    }
</script>

<style scoped>
.form-check {
    padding: 0;
}
</style>