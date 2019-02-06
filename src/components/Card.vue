<template>
    <div class="card">
        <h5 class="card-header" v-bind:class="color">
            <slot name="card-header" ></slot>
        </h5>
        <div class="card-body">
            <slot name="card-body"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'card',
    props: ['color']
}
</script>

<style scoped>
a {
    color: #495057;
}
a:hover {
    text-decoration: none;
}
.red-header {
    background-color: #c00a2b;
    color: #fff;
}
.blue-header {
    background-color: #1658a6;
    color: #fff;
}

</style>