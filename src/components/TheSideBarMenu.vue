<template>
    <div>
        <sidebar-menu :menu="menu" @collapse="onCollapse" :collapsed="collapsed" />
    </div>
</template>

<script>
    export default {
    name: 'SideBarmenu',
    props: ['page', 'collapsed'],
    data() {
        return {
            
        }
    },
    methods: {
        onCollapse(isCollapsed) {
            this.$emit('collapse', isCollapsed);
        }
    },
    computed: {
        menu() {
            if(this.$route.path == "/" || this.$route.path.startsWith('/home') || this.$route.path.startsWith('/account'))
            {
                return [
                    {
                        id: 0,
                        title: 'Overview',
                        href: '/',
                        icon: 'home'
                    },
                    {
                        id: 1,
                        title: 'Add Customer',
                        href: '/home/customer',
                        icon: 'plus',
                        roles: ['Admin', 'ProjectAdmin']
                    },
                    {
                        id: 2,
                        title: 'Add Operation Company',
                        href: '/home/opco',
                        icon: 'plus',
                        roles: ['Admin']
                    },
                    {
                        id: 2,
                        title: 'Add Project',
                        href: '/home/project',
                        icon: 'plus',
                        roles: ['Admin', 'ProjectAdmin']
                    }
                ]
            }

            if(this.$route.path.startsWith('/project'))
            {
                return [
                    {
                    id: 0,
                    title: 'Dashboard',
                    href: '/project/' + this.$route.params.projectId + '/dashboard',
                    icon: 'tachometer-alt'
                    },
                    {
                    id: 2,
                    title: 'Upload DUF',
                    href: '/project/' + this.$route.params.projectId + '/duf',
                    icon: 'upload',
                    roles: ['Admin', 'SuperUser']
                    },
                    {
                    id: 3,
                    title: 'ProjectOrders',
                    href: '/project/' + this.$route.params.projectId + '/projectorders',
                    icon: 'clipboard-list',
                    roles: ['Admin', 'SuperUser']
                    },
                    {
                    id: 3,
                    title: 'Expediting',
                    href: '/project/' + this.$route.params.projectId + '/expediting',
                    icon: 'stopwatch',
                    roles: ['Admin', 'Expediter']
                    },
                    {
                    id: 4,
                    title: 'Inspection',
                    href: '/project/' + this.$route.params.projectId + '/inspection',
                    icon: 'search',
                    roles: ['Admin', 'Inspector']
                    },
                    {
                        id: 5,
                        title: 'Shipping',
                        href: '/project/' + this.$route.params.projectId + '/shipping/in',
                        icon: 'ship',
                        roles: ['Admin', 'Shipper']
                    },
                    {
                    id: 6,
                    title: 'Warehouse',
                    href: '/project/' + this.$route.params.projectId + '/warehouse',
                    icon: 'warehouse',
                    roles: ['Admin', 'SuperUser', 'Warehouse'],
                    child: [
                            {
                                id: 1,
                                title: 'Goods Receipt',
                                href: '/project/' + this.$route.params.projectId + '/warehouse/goodsreceipt',
                                icon: 'cubes',
                                roles: ['Admin', 'SuperUser', 'Warehouse'],
                            },
                            {
                                id: 2,
                                title: 'Stock Management',
                                href: '/project/' + this.$route.params.projectId + '/warehouse/stock',
                                icon: 'cubes',
                                roles: ['Admin', 'SuperUser', 'Warehouse'],
                            },
                            {
                                id: 3,
                                title: 'Call-Off Order',
                                href: '/project/' + this.$route.params.projectId + '/warehouse/callofforder',
                                icon: 'clipboard-list',
                                roles: ['Admin', 'SuperUser', 'Warehouse'],
                            },
                            {
                                id: 4,
                                title: 'PickingLists',
                                href: '/project/' + this.$route.params.projectId + '/warehouse/pickinglists',
                                icon: 'clipboard-list',
                                roles: ['Admin', 'SuperUser', 'Warehouse'],
                            },
                            {
                                id: 4,
                                title: 'Outgoing Shipments',
                                href: '/project/' + this.$route.params.projectId + '/warehouse/shipping/out',
                                icon: 'ship',
                                roles: ['Admin', 'SuperUser', 'Warehouse'],
                            },
                            {
                                id: 5,
                                title: 'Project Warehouses',
                                href: '/project/' + this.$route.params.projectId + '/warehouse/locations',
                                icon: 'industry',
                                roles: ['Admin', 'SuperUser'],
                            }
                        ]
                    },
                    {
                    id: 7,
                    title: 'Configuration',
                    href: '/project/' + this.$route.params.projectId + '/configuration',
                    icon: 'cog',
                    roles: ['Admin', 'ProjectAdmin', 'SuperUser']
                    }]
            }
             else 
             {
                 return [];
             }
        }
    }
}
</script>

<style scoped>
</style>