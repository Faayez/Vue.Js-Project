<template>
    <div class="input-group">
        <input type="date" class="form-control" v-model="formattedDate" ref="input_control">
        <div class="input-group-append" ref="input_group_append">
            <span class="input-group-text">
                <v-icon name="calendar-alt"></v-icon>
            </span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'date-input',
    props: ['date'],
    data() {
        return {
        }
    },
    mounted() {
        let append = this.$refs.input_group_append,
            control = this.$refs.input_control;

        append.addEventListener('click', () => {
            control.focus();
        });
    },
    methods: {
    },
    computed: {
        formattedDate: {
            get() {
                return this.$i18n.d(this.date, 'short');
            },
            set(value) {
                this.$emit('input', value);
            }
        }
    }
}
</script>
<style scoped>
</style>