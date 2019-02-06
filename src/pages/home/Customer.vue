<template>
  <div id="homeCustomer" v-if="customer != null">
    <h2>Add or Edit Customer: {{customer.name}}</h2>
    <hr>
    <form @submit.prevent="saveCustomer" class="row">
        <div class="col-md-6">
            <h3>Address</h3>
            <div class="form-group row">
                <label for="customerCode" class="col-sm-2 col-form-label">Code</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="customerCode" v-model="customer.code" @change="makeDirty">
                </div>
            </div>
                <div class="form-group row">
                <label for="customerName" class="col-sm-2 col-form-label">Name</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="customerName"  v-model="customer.name" @change="makeDirty" required>
                </div>
            </div>
                <div class="form-group row">
                <label for="customerAddress" class="col-sm-2 col-form-label">Address</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="customerAddress" v-model="customer.address" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="customerZIP" class="col-sm-2 col-form-label">ZIP</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="customerZIP" v-model="customer.zip" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="comanyCity" class="col-sm-2 col">City</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="comanyCity" v-model="customer.city" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="customerCountry" class="col-sm-2 col-form-label">Country</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="customerCountry" v-model="customer.country" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="customerPhoneNumber" class="col-sm-2 col-form-label">Phone</label>
                <div class="col-sm-10">
                    <input type="tel" class="form-control" id="customerPhoneNumber" v-model="customer.phone" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="customerEmail" class="col-sm-2 col-form-label">Email</label>
                <div class="col-sm-10">
                    <input type="email" class="form-control" id="customerEmail" v-model="customer.email" @change="makeDirty">
                </div>
            </div>
            <div class="text-right">
                <button type="submit" class="btn btn-outline-dark btn-lg" :disabled="loading" @click="removeCustomer" v-if="this.customerId > 0">
                    <v-icon name="spinner" spin v-if="loading"></v-icon> Remove
                </button>
                <button type="submit" class="btn btn-lg" v-bind:class="[customer.isDirty ? 'btn-leeuwen' : 'btn-outline-leeuwen']" :disabled="!customer.isDirty || loading">
                    <v-icon name="spinner" spin v-if="loading"></v-icon> Save Customer
                </button>
            </div>
        </div>
        <div class="col-md-6">
            <h3>Invoice Address</h3>
            <div class="ml-4 mb-3">
                <input type="checkbox" class="form-check-input" id="projectSkipInspection" v-model="copyAddress" @change="makeDirty">
                <label class="form-check-label" for="projectSkipInspection">
                    Use the same address for invoices.
                </label><br />
            </div>
            <div v-if="!copyAddress">
                <div class="form-group row">
                <label for="invoiceName" class="col-sm-2 col-form-label">Name</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="invoiceName"  v-model="customer.invoiceName" @change="makeDirty">
                </div>
            </div>
                <div class="form-group row">
                <label for="invoiceAddress" class="col-sm-2 col-form-label">Address</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="invoiceAddress" v-model="customer.invoiceAddress" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="invoiceZIP" class="col-sm-2 col-form-label">ZIP</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="invoiceZIP" v-model="customer.invoiceZip" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="invoiceCity" class="col-sm-2 col">City</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="invoiceCity" v-model="customer.invoiceCity" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="invoiceCountry" class="col-sm-2 col-form-label">Country</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="invoiceCountry" v-model="customer.invoiceCountry" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="invoicePhoneNumber" class="col-sm-2 col-form-label">Phone</label>
                <div class="col-sm-10">
                    <input type="tel" class="form-control" id="invoicePhoneNumber" v-model="customer.invoicePhone" @change="makeDirty">
                </div>
            </div>
            <div class="form-group row">
                <label for="invoiceEmail" class="col-sm-2 col-form-label">Email</label>
                <div class="col-sm-10">
                    <input type="email" class="form-control" id="invoiceEmail" v-model="customer.invoiceEmail" @change="makeDirty">
                </div>
            </div>
            </div>
        </div>
    </form>
  </div>
</template>

<script>
import { customer } from '@/models/models.js';
export default {
  name: 'Customer',
  props: [],
  components: {
  },
  data () {
    return {
        loading: false,
        customer: {},
        copyAddress: true
    }
  },
    mounted() {
        this.getCustomer();
    },
  methods: {
      getCustomer() {
        if(this.customerId == null)
        {
            this.customer = new customer({})
        } else {
            return this.$http.get('api/Customers/' + this.customerId).then((res) => {
                return this.customer = new customer(res.data);
            });
        }
      },
    makeDirty() {
      this.customer.isDirty = true;
    },
    saveCustomer() {
        this.loading = true;
        if(!this.customerId)
        {
            if(this.copyAddress)
            {
                this.customer.invoiceName = this.customer.name;
                this.customer.invoiceAddress = this.customer.address;
                this.customer.invoiceZip = this.customer.zip;
                this.customer.invoiceCity = this.customer.city;
                this.customer.invoiceCountry = this.customer.country;
                this.customer.invoicePhoneNumber = this.customer.phoneNumber;
                this.customer.invoiceEmail = this.customer.email;
            };

            this.$http.post('api/customers/', this.customer).then((res) => {
                this.customer = res.data;
                this.customer.isDirty = false;
                this.loading = false;
            }).catch((res) => {
                this.loading = false;
            })
        } else {
            this.$http.put('api/customers/' + this.customerId, this.customer).then((res) => {
                this.customer.isDirty = false;
                this.loading = false;
            }).catch((res) => {
                this.loading = false;
            })
        };
    },
    removeCustomer() {
      if(confirm('DELETE CUSTOMER! Are you sure?')) {
        this.loading = true;
        this.$http.delete('api/customers/' + this.customerId).then((res) => {
            this.loading = false;
            this.$router.push({ name: 'Index' });
        }).catch((res) => {
            this.loading = false;
        })
      }
    }
  },
  computed: {
    customerId() {
      return this.$route.params.id;
    }
  },
  watch:
  {
      customerId(to, from) {
        this.getCustomer();
      },
      copyAddress(to, from)
      {
          if(to)
          {
              this.customer.invoiceName = this.customer.name;
              this.customer.invoiceAddress = this.customer.address;
              this.customer.invoiceZip = this.customer.zip;
              this.customer.invoiceCity = this.customer.city;
              this.customer.invoiceCountry = this.customer.country;
              this.customer.invoicePhoneNumber = this.customer.phoneNumber;
              this.customer.invoiceEmail = this.customer.email;
              this.makeDirty();
          }
      }
  }
}
</script>

<style scoped>
</style>
