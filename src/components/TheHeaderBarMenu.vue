<template>
    <headerbar-menu :menu="menu" @collapse="onCollapse" :collapsed="collapsed" />
</template>

<script>
    export default {
    name: 'HeaderBarMenu',
    props: ['page', 'collapsed'],
    data() {
        return {
            menu: [
                {
                    href: '/',
                    title: 'Dashboard',
                    icon: 'chart-line',
                    child: [
                        {
                            href: '#charts',
                            title: 'Charts',
                            icon: 'fa fa-chart-area'
                        }
                    ]
                },
                {
                    href: '#charts',
                    title: 'Charts',
                    icon: 'fa fa-chart-area'
                },
            ]
        }
    },
    methods: {
        onCollapse(collapsed) {
            this.$emit('collapse', collapsed);
        }
    }
}
</script>

<style scoped>
</style>