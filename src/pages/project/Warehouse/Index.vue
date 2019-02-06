<template>
    <div id="warehouse">
        <h2>Warehouse - {{title}}</h2>
        <div v-if="$route.name == 'Warehouse'" class="mt-3" >
            <div class="row" v-if="$store.getters.role == 'Warehouse'">
                <div class="col-md-4">
                    <router-link class="card" tag="a" :to="'/project/' + $route.params.projectId + '/warehouse/goodsreceipt'" >
                        <div class="card-body">
                            <div class="text-center">
                            <v-icon name="cubes" scale="3"></v-icon>
                            <h3>Goods Receipt</h3>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div class="col-md-4">
                    <router-link class="card" tag="a" :to="'/project/' + $route.params.projectId + '/warehouse/callofforder'" >
                        <div class="card-body">
                            <div class="text-center">
                            <v-icon name="clipboard-list" scale="3"></v-icon>
                            <h3>Call-Off Order</h3>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div class="col-md-4">
                    <router-link class="card" tag="a" :to="'/project/' + $route.params.projectId + '/warehouse/shipping'" >
                        <div class="card-body">
                            <div class="text-center">
                            <v-icon name="ship" scale="3"></v-icon>
                            <h3>Shipping</h3>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
            <div v-else>
                <div class="col-md-4 offset-md-3">
                    <router-link class="card" tag="a" :to="'/project/' + $route.params.projectId + '/warehouse/locations'" >
                        <div class="card-body">
                            <div class="text-center">
                            <v-icon name="industry" scale="3"></v-icon>
                            <h3>Project Warehouses</h3>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    name: 'warehouse',
    props: [],
    components: {
    },
    data () {
        return {
        }
    },
    mounted() {
    },
    methods: {
    },
    computed: {
        projectId() {
            return this.$route.params.projectId;
        },
        title() {
            return this.$route.meta.title;
        }
    }
}
</script>
<style scoped>

</style>