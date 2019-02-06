<template>
    <div id="projectConfiguration">
            <h2>Project Configuration</h2>
            <tab-component :tabs="tabs"></tab-component>
    </div>
</template>

<script>
import Tabs from '@/components/Tabs';
import Translations from '@/pages/project/tabs/configuration/Translations'
//import UserDefinedFields from '@/pages/project/tabs/configuration/UserDefinedFields'
import ProjectUsers from '@/pages/project/tabs/configuration/ProjectUsers'
import Grids from '@/pages/project/tabs/configuration/Grids'
import General from '@/pages/project/tabs/configuration/General'
import Templates from '@/pages/project/tabs/configuration/Templates'
export default {
    name: 'projectConfiguration',
    components: {
        'tab-component': Tabs
    },
    data() {
        return {
            tabs: [{
                id: 'general-tab',
                label: 'General',
                component: General,
                active: true,
                isLoaded: false
            },{
                id: 'translations-tab',
                label: 'Translations',
                component: Translations,
                active: false,
                isLoaded: false
            },
            {
                id: 'project-users-tab',
                label: 'Project Users',
                component: ProjectUsers,
                active: false,
                isLoaded: false
            },
            {
                id: 'fields',
                label: 'Grids',
                component: Grids,
                active: false,
                isLoaded: false
            },
            {
                id: 'templates-tab',
                label: 'Templates',
                component: Templates,
                active: false,
                isLoaded: false
            }]
        }
    },
    computed: {
        projectId() {
            return this.$route.params.projectId;
        }
    }
}
</script>

<style scoped>
</style>