<template>
    <div class="input-group">
        <div class="input-group-prepend">
            <button class="btn btn-outline-secondary" type="button" id="button-addon1" @click="minus">-</button>
        </div>
        <input type="number" class="form-control text-center" v-model="quantity" :min="(min == null) ? 0 : min" :max="max" @change="change">
        <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" id="button-addon1" @click="plus">+</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'number-input',
    props: ['obj', 'qty', 'min', 'max'],
    data() {
        return {
            quantity: this.qty
        }
    },
    methods: {
        change()
        {
            if(this.quantity > this.max && this.max != null)
            {
                this.quantity = this.max;
            }

            if(this.quantity < this.min && this.min != null)
            {
                this.quantity = this.min;
            }
        },
        plus() {
            if(this.quantity < this.max || this.max == null)
            {
                this.quantity++;
            }
        },
        minus() {
            if(this.quantity > this.min || this.min == null)
            {
                this.quantity--;
                
            }
        }
    },
    watch:{
        quantity(to)
        {
            this.$emit('change', to, this.obj);
        },
        qty(to)
        {
            this.quantity = to;
        }
    }
}
</script>