<template>
  <div id="homeOpco" v-if="opco != null">
    <h2>Add or Edit Operating Company: {{opco.name}}</h2>
    <hr>
    <form @submit.prevent="saveOpco">
        <div class="form-group row">
            <label for="opcoCode" class="col-sm-2 col-form-label">Code</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="opcoCode" v-model="opco.code" @change="makeDirty">
            </div>
        </div>
            <div class="form-group row">
            <label for="opcoName" class="col-sm-2 col-form-label">Name</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="opcoName"  v-model="opco.name" @change="makeDirty">
            </div>
        </div>
            <div class="form-group row">
            <label for="opcoAddress" class="col-sm-2 col-form-label">Address</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="opcoAddress" v-model="opco.address" @change="makeDirty">
            </div>
        </div>
        <div class="form-group row">
            <label for="opcoZIP" class="col-sm-2 col-form-label">ZIP</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="opcoZIP" v-model="opco.zip" @change="makeDirty">
            </div>
        </div>
        <div class="form-group row">
            <label for="comanyCity" class="col-sm-2 col">City</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="comanyCity" v-model="opco.city" @change="makeDirty">
            </div>
        </div>
        <div class="form-group row">
            <label for="opcoCountry" class="col-sm-2 col-form-label">Country</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="opcoCountry" v-model="opco.country" @change="makeDirty">
            </div>
        </div>
        <div class="form-group row">
            <label for="opcoUser" class="col-sm-2 col-form-label">Project Admins</label>
            <div class="col-sm-10">
                <div class="input-group">
                    <select class="form-control" id="opcoUser" v-model="selectedUser">
                        <option v-for="user in users" :key="user.id" :value="user.userName">{{user.userName}}</option>
                    </select>
                    <div class="input-group-append">
                        <button class="btn btn-leeuwen-blue" @click="addUser" type="button">
                            <v-icon name="plus"></v-icon>
                        </button>
                    </div>
                </div>
                <ul class="list-group mt-3" >
                    <li class="list-group-item" v-for="u in opco.projectAdmins" :key="u.userName">
                        <span class="inline">{{u.userName}}</span>
                        <div class="right inline">
                            <button class="btn btn-leeuwen btn-sm inline" @click="removeUser" type="button">
                                <v-icon name="trash-alt"></v-icon>
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="text-right">
            <button type="submit" class="btn btn-outline-dark btn-lg" :disabled="loading" @click="removeOpco" v-if="this.opcoId > 0">
                <v-icon name="spinner" spin v-if="loading"></v-icon> Remove
            </button>
            <button type="submit" class="btn btn-lg" v-bind:class="[opco.isDirty ? 'btn-leeuwen' : 'btn-outline-leeuwen']" :disabled="!opco.isDirty || loading">
                <v-icon name="spinner" spin v-if="loading"></v-icon> Save OPCO
            </button>
        </div>
    </form>
    <hr>
    <file-input :set="'api/Opcos/Upload/'"></file-input>
  </div>
</template>

<script>
import FileInput from '@/components/FileInput';
import { oPCO, projectAdmin } from '@/models/models.js';
export default {
  name: 'Opco',
  props: [],
  components: {
        'file-input': FileInput
  },
  data () {
    return {
        loading: false,
        opco: null,
        users: [],
        selectedUser: null
    }
  },
  mounted() {
      this.getOpco();
      this.getUsers();
  },
  methods: {
    getOpco() {
        if(this.opcoId == null)
        {
            this.opco = new oPCO({ projectAdmins: [] });
        } else {
            return this.$http.get('api/Opcos/' + this.opcoId).then((res) => {
                res.data.projectAdmins = res.data.projectAdmins.map((p) => { return new projectAdmin(p) });
                return this.opco = new oPCO(res.data);
            });
        }
    },
    getUsers() {
        return this.$http.get('api/User/All').then((res) => {
            this.users = res.data.map((u) => { return u; });
        })
    },
    addUser()
    {
        if(!this.opco.projectAdmins.some((c) => { return c.userName == this.selectedUser }))
        {
            this.opco.projectAdmins.push(new projectAdmin({
                userName: this.selectedUser,
                opcoId: this.opco.id
            }));
            this.opco.isDirty = true;
        }
    },
    removeUser(user)
    {
        this.opco.projectAdmins.splice(this.opco.projectAdmins.indexOf(user), 1);
        this.opco.isDirty = true;
    },
    makeDirty() {
      this.opco.isDirty = true;
    },
    saveOpco() {
        this.loading = true;
        if(!this.opcoId)
        {
            this.$http.post('api/opcos/', this.opco).then((res) => {
                this.opco = res.data;
                this.opco.isDirty = false;
                this.loading = false;
            }).catch((res) => {
                this.loading = false;
            })
        } else {
            this.$http.put('api/opcos/' + this.opcoId, this.opco).then((res) => {
                this.opco.isDirty = false;
                this.loading = false;
            }).catch((res) => {
                this.loading = false;
            })
        };
    },
    removeOpco() {
        if(confirm('DELETE OPCO! Are you sure?')) {
            this.loading = true;
            this.$http.delete('api/opcos/' + this.opcoId).then((res) => {
                this.$router.push({ name: 'Index' });
                this.loading = false;
            })
            .catch(() => {
                this.loading = false;
            })
        };
    }
  },
  computed: {
    opcoId() {
      return this.$route.params.id;
    }
  },
    watch:
    {
        opcoId(to, from) {
            this.getOpco();
        }
    }
}
</script>

<style scoped>
.inline
{
    display: inline-block;
}
.right 
{
    float: right;
}
</style>
