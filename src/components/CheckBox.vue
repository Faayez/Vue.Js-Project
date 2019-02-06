<template>
    <div class="form-check">
        <label class="form-check-label" @click="toggle">
            <v-icon :name="icon" :scale="scale" :style="{ 'color': [ checked ? 'black' : 'gray'] }" ></v-icon> <span v-if="showLabel" v-bind:style="{ fontSize: labelScale }">{{label}}</span>
        </label>
        <input type="checkbox" :checked="checked" hidden />
    </div>
</template>

<script>
export default {
    name: 'CheckBox',
    props: ['label', 'object', 'check', 'property', 'size', 'circle'],
    data() {
        return {
            checked: this.check,
            showLabel: false,
            scale: 1
        }
    },
    mounted() {
        if(this.size != null && !isNaN(this.size))
        {
            this.scale = this.size;
        }
        if(this.check != null && typeof(this.check) === "boolean") {
            this.checked = this.check;
        };
        if(this.label != null && this.label.length > 0) {
            this.showLabel = true;
        }
    },
    updated() {
        this.checked = this.check;
    },
    methods: {
        toggle() {
            if(this.checked) {
                this.checked = false;
            } else {
                this.checked = true;
            }
            //this.object[this.property] = this.checked;
            this.$emit('toggle', this.object, this.property, this.checked);
        }
    },
    watch: {
        check(newValue, oldValue) {
            this.checked = newValue;
        }
    },
    computed: {
        icon() {
            if(this.circle)
            {
                return (this.checked) ? 'regular/check-circle' : 'regular/circle';
            }
            return (this.checked) ? 'regular/check-square' : 'regular/square';
        },
        labelScale() {
            return this.scale + 'rem';
        }
    }
}
</script>

<style scoped>
.form-check-label span {
    vertical-align: middle;
}
label{
    cursor: pointer;
}
</style>