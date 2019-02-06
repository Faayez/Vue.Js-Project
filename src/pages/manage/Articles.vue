<template>
<table-grid id="articles-table" :options="options"></table-grid>
</template>
<script>
import TableGrid from '@/components/TableGrid'
export default {
    name: 'articles',
    components: {
        'table-grid': TableGrid
    },
    data() {
        return {
            articles: [],
            options: {
                api: 'api/articles',
                hidden: ['id','isDeleted','createdBy','modifiedBy','createDate','modifyDate','userDefinedFields'],
                multiple: true
            }
        }
    },
    methods: {
        
    }
}
</script>
<style scoped>
</style>