<template>
    <li :class="[{'has-dropdown' : item.child}, {'open' : show}]" @mouseenter="mouseEnter($event)" @mouseleave="mouseLeave($event)">
        <template v-if="isRouterLink">
            <router-link :to="item.href" @click.native="clickEvent">
                <v-icon v-if="item.icon" class="item-icon" :name="item.icon"></v-icon>
                <template v-if="!isCollapsed">
                    <span class="item-text">{{item.title}}</span>
                    <v-icon name="angle-right" v-if="item.child" class="item-arrow"></v-icon>
                </template>
            </router-link>
        </template>
        <template v-else>
            <a :href="!item.child ? item.href : '#'" @click="clickEvent" :class="{'active' : isLinkActive}" >
                <v-icon v-if="item.icon" class="item-icon" :icon="item.icon"></v-icon>
                <template v-if="!isCollapsed">
                    <span class="item-text">{{item.title}}</span>
                    <v-icon name="angle-right" v-if="item.child"  class="item-arrow"></v-icon>
                </template>
            </a>
        </template>
        <div class="dropdown" v-if="!isCollapsed && item.child">
            <transition name="show-animation">
                <ul v-if="show">
                    <sub-item v-for="(subItem, index) in item.child" :item="subItem" :key="index" v-if="isInRole(subItem)" />
                </ul>
            </transition>
        </div>
    </li>
</template>

<script>
import SubItem from './SubItem.vue'
import {itemMixin} from '../mixin'

export default {
    data() {
        return {
            show: false,
        }
    },
    props: {
        item: {
            type: Object,
            required: true
        },
        firstItem: {
            type: Boolean,
            default: false
        },
        isCollapsed: {
            type: Boolean,
        },
    },
    components: {
        SubItem
    },
    mixins: [itemMixin],
    created() {
        if ( this.firstItem ) {
            this.$parent.$on('collapse',  this.closeDropdown)
        }
    },
    methods: {
        mouseEnter(event) {
            if (this.isCollapsed && this.firstItem) {
               this.$parent.$emit('mouseEnterItem', {item : this.item, pos: event.currentTarget.getBoundingClientRect().top})
            }
        },
        mouseLeave(event) {
            if (this.isCollapsed && this.firstItem) {
               this.$parent.$emit('mouseLeaveItem', {item : this.item, pos: event.currentTarget.getBoundingClientRect().top})
            }
        },
        isInRole(tab) {
            if(tab.roles != null) {
                if(tab.roles.some((r) => { return this.roles.indexOf(r) >= 0}))
                {
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        },
    },
    computed: {
        role() {
            return this.$store.getters.role
        },
        roles() {
            return this.$store.getters.roles
        }
    },
}
</script>

