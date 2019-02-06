<template>
    <div class="text-center" v-if="loading">
        <v-icon name="spinner" spin></v-icon>
    </div>
</template>

<script>
    export default {
        name: 'loader',
        props: {
            loading: { type: Boolean, required: true, default: false },
        }
    }
</script>