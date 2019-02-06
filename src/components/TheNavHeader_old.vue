<template>
    <div id="theNavHeader">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <router-link tag="a" class="navbar-brand" :to="{ name: 'Index' }">
                <img src="static/VL_logo_01_2400_rgb_pos_colour.png" height="30" alt="">
            </router-link>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent" v-if="isAuthenticated">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item dropdown" v-if="currentRoute == 'Index'">
                        <a class="nav-link dropdown-toggle" href="#" id="customersDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {{ $t('Customers') }}
                        </a>
                        <div class="dropdown-menu" aria-labelledby="customersDropdown">
                            <router-link tag="a" class="dropdown-item" :to="{ name: 'Customer', params: { customerId: customer.id }}" :key="customer.id" v-for="customer in customers">{{customer.name}}</router-link>
                        </div>
                    </li>
                    <li class="nav-item dropdown" v-if="currentRoute == 'Index'">
                        <a class="nav-link dropdown-toggle" href="#" id="opcoDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {{ $t('Operating Companies') }}
                        </a>
                        <div class="dropdown-menu" aria-labelledby="opcoDropdown">
                            <router-link tag="a" class="dropdown-item" :to="{ name: 'Opco', params: { opcoId: opco.id }}" :key="opco.id" v-for="opco in opcos">{{opco.name}}</router-link>
                        </div>
                    </li>
                </ul>
                <form class="form-inline" v-if="isAuthenticated">
                    <div v-if="currentRoute == 'Index'">
                        <button class="btn btn-leeuwen" type="button" data-toggle="modal" data-target="#newCustomerModal" v-if="currentRoute == 'Index' && view == 'Customer'">
                            <v-icon name="plus"></v-icon> {{ $t('New Customer')}}
                        </button>
                        <button class="btn btn-leeuwen" type="button" data-toggle="modal" data-target="#newOpcoModal" v-if="currentRoute == 'Index' && view == 'Opco'">
                            <v-icon name="plus"></v-icon> {{ $t('New Opco')}}
                        </button>
                        <button class="btn btn-outline-leeuwen" type="button" v-if="currentRoute == 'Index'" @click="switchView">
                            <v-icon name="eye"></v-icon> {{ $t('Switch View')}}
                        </button>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-outline-leeuwen-blue dropdown-toggle" type="button" id="roleDropdownBtn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {{$t(role)}}
                        </button>
                        <div class="dropdown-menu">
                            <div class="dropdown-item" :key="role.index" v-for="role in roles" @click="setRole(role)">{{$t(role)}}</div>
                        </div>
                    </div>
                    <languageSwitcher></languageSwitcher>
                    <button class="btn btn-outline-leeuwen-blue btn-round" type="button">
                        <v-icon name="user"></v-icon> 
                    </button>
                    <button class="btn btn-outline-leeuwen-blue btn-round" type="button">
                        <v-icon name="cog"></v-icon> 
                    </button>
                    <button class="btn btn-outline-leeuwen btn-round" type="button" @click="logOut">
                        <v-icon name="sign-out-alt"></v-icon> 
                    </button>
                </form>
            </div>
        </nav>
        <modal id="newCustomerModal" :save="saveCustomer"  :isSmall="true">
            <template slot="title">{{$t('New Customer')}}</template>
            <template slot="body">
                <div class="form-group row">
                    <label for="customerCode" class="col-sm-2 col-form-label">{{$t('Code')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="customerCode" v-model="customer.code">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="customerName" class="col-sm-2 col-form-label">{{$t('Name')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="customerName"  v-model="customer.name">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="customerAddress" class="col-sm-2 col-form-label">{{$t('Address')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="customerAddress" v-model="customer.address">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="customerZIP" class="col-sm-2 col-form-label">{{$t('ZIP')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="customerZIP" v-model="customer.zip">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="comanyCity" class="col-sm-2 col">{{$t('City')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="comanyCity" v-model="customer.city">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="customerCountry" class="col-sm-2 col-form-label">{{$t('Country')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="customerCountry" v-model="customer.country">
                    </div>
                </div>
            </template>
        </modal>
        <modal id="newOpcoModal" :save="saveOpco"  :isSmall="true">
            <template slot="title">{{$t('New Opco')}}</template>
            <template slot="body">
                <div class="form-group row">
                    <label for="opcoCode" class="col-sm-2 col-form-label">{{$t('Code')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="opcoCode" v-model="opco.code">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="opcoName" class="col-sm-2 col-form-label">{{$t('Name')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="opcoName" v-model="opco.name">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="opcoAddress" class="col-sm-2 col-form-label">{{$t('Address')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="opcoAddress" v-model="opco.address">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="opcoZIP" class="col-sm-2 col-form-label">{{$t('ZIP')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="opcoZIP" v-model="opco.zip">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="comanyCity" class="col-sm-2 col">{{$t('City')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="comanyCity" v-model="opco.city">
                    </div>
                </div>
                    <div class="form-group row">
                    <label for="opcoCountry" class="col-sm-2 col-form-label">{{$t('Country')}}</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="opcoCountry" v-model="opco.country">
                    </div>
                </div>
            </template>
        </modal>
    </div>
</template>
<script>
import LanguageSwitcher from '@/translation/LanguageSwitcher'
import Modal from '@/components/Modal'
import { customer, opco } from '@/models';
export default {
    name: 'the-nav-header',
    components: {
        'modal': Modal,
        'languageSwitcher': LanguageSwitcher
    },
    data() {
        return {
            deliveryConditions: [],
            customer: new customer({}),
            opco: new opco({})
        }
    },
    methods: {
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
        role() {
            return this.$store.getters.role
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
</style>