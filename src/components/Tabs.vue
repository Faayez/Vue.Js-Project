<template>
    <div id="tabs">
        <ul class="nav nav-tabs">
            <li class="nav-item" :key="tab.index" v-for="tab in tabs">
                <a class="nav-link" :href="'#' + tab.id" data-toggle="tab" @click.stop.prevent="activate(tab, $event)"  :class="{active: tab.active}">{{tab.label}}</a>
            </li>
        </ul>
        <div class="tab-content" id="tab-content">
            <component v-bind:is="tab.component" :tab="tab" :key="tab.index" v-for="tab in tabs" v-if="tab.isLoaded" :class="{active: tab.active}"></component>
        </div>
    </div>
</template>
    
<script>
    export default {
        name: 'Tabs',
        props: ['tabs'],
        methods: {
            activate(tab, ev) 
            {
                this.tabs.forEach((t) => { return t.active = false });
                tab.isLoaded = true;
                tab.active = true;
                return false;
            }
        },
        mounted() {
            this.activate(this.tabs[0]);
        }
    }
</script>

<style scoped>
.tab-content {
    padding: 15px;
    border: 1px solid transparent;
    border-color: #fff #dee2e6 #dee2e6 #dee2e6
}
</style>