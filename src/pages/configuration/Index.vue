<template>
    <tab-component :tabs="tabs"></tab-component>
</template>

<script>
import Tabs from '@/components/Tabs';
export default {
    name: 'Project Configuration',
    components: {
        'tab-component': Tabs
    },
    data() {
        return {
            tabs: []
        }
    }
}
</script>

<style scoped>
</style>