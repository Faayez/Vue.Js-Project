<template>
    <div id="calloforder">
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h5>PickingLists To Do</h5>
                    </div>
                    <div class="card-body">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">
                                    <v-icon name="search"></v-icon>
                                </span>
                            </div>
                            <input class="form-control" type="text" placeholder="Search Pickinglist..." v-model="filter" />
                        </div>
                        <div class="list-group" id="list-tab" role="tablist" >
                            <router-link tag="a" class="list-group-item list-group-item-action" data-toggle="list" role="tab" :to="{ name: 'PickingList', params: { pickingListId: p.id }}" v-for="p in filteredPickingLists" :key="p.id">
                                {{p.id}} - {{p.name}}
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="tab-content" id="nav-tabContent">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Table from '@/components/Table';
import NumberInput from '@/components/NumberInput';
export default {
    components: {
        'table-component': Table
    },
    data() {
        return {
            pickingLists: [],
            filter: ''
        }
    },
    created() {
        this.getPickingLists();
    },
    methods: {
        getPickingLists() {
            this.$http.get('api/PickingLists/' + this.$route.params.projectId).then((res) => {
                this.pickingLists = res.data;
            });
        },
        
    },
    computed: {
        filteredPickingLists() {
            return this.pickingLists.filter((c) => { return c.name.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0 });
        }
    },
    watch: {
    }

}
</script>

<style scoped>
.router-link-active {
    background-color: #1658a6;
    color: white;
}
</style>