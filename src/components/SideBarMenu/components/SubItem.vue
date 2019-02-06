<template>
    <li :class="[{'has-dropdown' : item.child}, {'open' : show}]">
        <template v-if="isRouterLink">
            <router-link :to="item.href" @click.native="clickEvent">
                <v-icon v-if="item.icon" class="item-icon" :name="item.icon" ></v-icon>
                <span class="item-text">{{item.title}}</span>
                <v-icon name="angle-right" v-if="item.child"></v-icon>
            </router-link>
        </template>
        <template v-else>
            <a :href="!item.child ? item.href : '#'" @click="clickEvent" :class="{'active' : isLinkActive}">
                <v-icon v-if="item.icon" class="item-icon" :name="item.icon" ></v-icon>
                <span class="item-text">{{item.title}}</span>
                <v-icon name="angle-right" v-if="item.child"></v-icon>
            </a>
        </template>
        <div class="dropdown" v-if="item.child">
            <transition name="show-animation">
                <ul v-if="show">
                    <item v-for="(subItem, index) in item.child" :item="subItem" :key="index" />
                </ul>
            </transition>
        </div>
    </li>
</template>

<script>
import Item from './Item.vue'
import {itemMixin} from '../mixin'

export default {
    data() {
        return {
            show: false,
        }
    },
    mixins: [itemMixin],
    props: {
        item: Object,
    },
    components: {
        Item
    },
    beforeCreate() {
        this.$options.components.Item = require('./Item.vue').default
    },
}
</script>
