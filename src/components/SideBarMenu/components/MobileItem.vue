<template>
    <li :class="[{'has-dropdown open' : item && item.child}]" :zIndex="zIndex">
        <router-link v-if="isRouterLink" :to="item.href">
            {{item.title}}
            <v-icon name="angle-right" v-if="item.child"  class="item-arrow"></v-icon>
        </router-link>
        <a v-else-if="item" :href="!item.child ? item.href : '#'" @click="clickEvent">
            {{item.title}}
            <v-icon name="angle-right" v-if="item.child"  class="item-arrow"></v-icon>
        </a>
        <div class="item-bg">
            <transition name="slide-animation">
                <span v-if="item"></span>
            </transition>
        </div>
        <div class="dropdown" :style="{'max-height' : `calc(100vh - ${mobileItemPos + 50}px)`}">
            <transition name="show-animation">
                <ul v-if="item && item.child">
                    <sub-item v-for="(subItem, index) in item.child" :item="subItem" :key="index"  v-if="isInRole(subItem)"/>
                </ul>
            </transition>
        </div>
    </li>
</template>

<script>
import SubItem from './SubItem.vue'
import {itemMixin} from '../mixin'

export default {
    props: {
        item: {
            type: Object,
        },
        mobileItemPos: {
            type: Number,
            required: true
        }
    },
    components: {
        SubItem
    },
    methods: {
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
        },
        zIndex() {
            if(this.mobileItemPos == -50)
                return -1;
            return 20;
        }
    },
    mixins: [itemMixin],
}
</script>