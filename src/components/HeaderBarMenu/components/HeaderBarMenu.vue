<template>
<nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <span class="navbars" :class="{ 'collapsed': collapsed }" @click="toggleCollapse">
          <v-icon name="bars" scale="2"></v-icon>
      </span>
    <form class="form-inline ml-auto" v-if="isAuthenticated">
        <languageSwitcher></languageSwitcher>
        <router-link tag="button" to="/account/user" class="btn btn-outline-leeuwen-blue btn-round" type="button" :title="user.userName">
            <v-icon name="user"></v-icon> 
        </router-link>
        <router-link tag="button" to="/account/settings" class="btn btn-outline-leeuwen-blue btn-round" type="button" v-if="roles.indexOf('Admin') >= 0" title="settings">
            <v-icon name="cog"></v-icon> 
        </router-link>
        <button class="btn btn-outline-leeuwen btn-round" type="button" @click="logOut" title="Log-out">
            <v-icon name="sign-out-alt"></v-icon> 
        </button>
    </form>
  </div>
</nav>
</template>

<script>
import LanguageSwitcher from '@/translation/LanguageSwitcher'
import Modal from '@/components/Modal'
import { customer, oPCO } from '@/models/models.js';
export default {
    props: ['collapsed'],
    components: {
        'modal': Modal,
        'languageSwitcher': LanguageSwitcher
    },
    data() {
        return {
            deliveryConditions: [],
            customer: new customer({}),
            opco: new oPCO({})
        }
    },
    methods: {
        toggleCollapse() {
            this.$emit('collapse', (this.collapsed) ? false : true);
        },
        saveCustomer() {
            this.$http.post('api/customers', this.customer).then((res) => {
                this.$store.dispatch('ADD_CUSTOMER', res.data);
                this.customer = new customer({});
                document.getElementById('newCustomerModal').querySelector('button[data-dismiss=modal]').click();
            });
        },
        saveOpco() {
            this.$http.post('api/opcos', this.opco).then((res) => {
                this.$store.dispatch('ADD_OPCO', res.data);
                this.customer = new customer({});
                document.getElementById('newOpcoModal').querySelector('button[data-dismiss=modal]').click();
            });
        },
        switchView() {
            if(this.view == "Customer") {
                this.$store.dispatch("SET_VIEW", "Opco")
            } else {
                this.$store.dispatch("SET_VIEW", "Customer")
            };
        },
        logOut() {
            this.$store.dispatch('AUTH_LOGOUT');
            return this.$router.push({ name: 'Login' });
        },
        setRole(role) {
            this.$store.dispatch("SET_ROLE", role);
        }
    },
    computed: 
    {
        view() {
            return this.$store.getters.view;
        },
        opcos() {
            return this.$store.getters.opcos;
        },
        customers() {
            return this.$store.getters.customers;
        },
        currentRoute() {
            return this.$store.getters.currentRoute;
        },
        isAuthenticated() {
            return this.$store.getters.isAuthenticated;
        },
        user() {
            return this.$store.getters.user
        },
        roles() {
            return this.$store.getters.roles
        }
    }
}
</script>

<style scoped>
    button {
        margin-left: 10px;
    }
    .navbar {
        padding: 15px;
    }
    .menu-item {
        margin-left: 15px;
        color: #c00a2b;
    }
    .icon {
        position: relative;
        height: 40px;
        width: 40px;
    }
    .navbars {
        transition: 0.3s transform;
        color: #c00a2b;
        cursor: pointer;
    }
    .navbars.collapsed {
        transform: rotate(90deg);
    }
    .icon svg {
        position: absolute;
        top:0;
        bottom:0;
        right:0;
        left:0;
        margin:auto;
        color: #c00a2b;
    }
    .icon:hover {
        cursor: pointer;
        background-color: #2a2a2a;
        color: #c00a2b
    }
    .bordered {
        border: 1px solid #c00a2b;
    }
    .round {
        border-radius: 50%;
    }
</style>