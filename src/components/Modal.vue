<template>
    <div class="modal" tabindex="-1" role="dialog" v-bind:id="id" :ref="id" >
        <div class="modal-dialog" role="document" v-bind:class="{ small : isSmall }">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <slot name="title"></slot>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" :disabled="saving">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <slot name="body"></slot>
                </div>
                <div class="modal-footer" v-if="showFooter || showFooter == null">
                    <slot name="buttons">
                    </slot>
                    <button type="button" class="btn btn-leeuwen-blue" @click="saveChanges" :disabled="saving">
                       <v-icon :name="spinner" :spin="saving ? true : false"></v-icon> Save changes
                    </button>
                    <button type="button" class="btn btn-dark" data-dismiss="modal" id="closeBtn" :disabled="saving">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'modal',
    props: ['id', 'save', 'showFooter', 'isSmall', 'show'],
    data() {
        return {
            saving: false
        }
    },
    mounted() {
        let modal = document.querySelector('#' + this.id);
        modal.addEventListener('shown.bs.modal', function(event) {
            debugger
        });
        
    },
    methods: {
        saveChanges() {
            if(this.save != null) {
                this.saving = true;
                return new Promise((resolve, reject) => {
                    this.save().then((res) =>{
                        resolve(res);
                    }).catch((err) => 
                    {
                        this.saving = false;
                        resolve(false);
                        alert((!!err.data) ? err.data : err);
                    })
                }).then((res) => {
                    this.saving = false;
                    setTimeout(() => {
                        if(res)
                            this.$refs[this.id].querySelector("#closeBtn").click();
                    },1);
                });
            } else {
                this.$refs[this.id].querySelector("#closeBtn").click();
            }
        }
    },
    computed: {
        spinner() {
            return this.saving ? 'spinner' : 'save';
        }
    }
};
</script>

<style scoped>
.modal-dialog {
    max-width: 90%
}
.small 
{
    max-width: 500px !important;
}
.modal-header {
    color: #fff;
    background-color: #c00a2b;
}
.modal-header .close, .modal-header .close:hover {
    color: #fff;
}
</style>