<template>
    <div id="user">
        <h2>Register new users</h2>
        <div class="row">
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h5>New User</h5>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="register">
                            <div class="form-group">
                                <label>UserName</label>
                                <input class="form-control form-control-lg" v-model="user.userName" type="email" name="pdbUsername" id="pdbUsername" />
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input class="form-control form-control-lg" v-model="user.password" type="password" name="pdbPassword" id="pdbPassword" />
                            </div>
                            <div class="form-group">
                                <label>Confirm Password</label>
                                <input class="form-control form-control-lg" v-model="user.confirmPassword" type="password" name="pdbConfirmPassword" id="pdbConfirmPassword" />
                            </div>
                            <button type="submit" class="btn btn-leeuwen btn-full btn-lg" :disabled="loading">
                                <v-icon name="spinner" spin v-if="loading"></v-icon> Register
                            </button>
                            <div class="alert alert-danger" role="alert" v-if="showError">
                                <strong>Registration Failed</strong> Could not register {{user.userName}}.
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5>Users</h5>
                    </div>
                    <div class="card-body table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>UserName</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Admin</th>
                                    <th>2FA Enabled</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :key="u.id" v-for="u in users">
                                    <td>{{u.userName}}</td>
                                    <td>{{u.email}}</td>
                                    <td>{{u.phoneNumber}}</td>
                                    <td>
                                        <checkbox :object="u" v-on:toggle="enableAdmin" :check="u.isAdmin" property="isAdmin"></checkbox>
                                    </td>
                                    <td>
                                        <button class="btn btn-Itifmedical btn-sm" :disabled="!u.twoFactorEnabled" @click="reset2FA(u)">Reset 2FA</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import QRCode from 'qrcode';
import CheckBox from '@/components/CheckBox';
export default {
    components: {
        'checkbox': CheckBox
    },
    data() {
        return {
            loading: false,
            users: [],
            user: {
                userName: null,
                password: null,
                confirmPassword: null
            },
            success: false,
            showError: false
        }
    },
    created() {
        this.getUsers();
    },
    methods: {
        register() {
            if(this.user.password != this.user.confirmPassword)
                return;

            this.showError = false;
            this.loading = true;
            this.$http.post('api/Auth/Register', this.user).then((res) => {
                this.loading = false;
                this.users.push(res.data);
            })
            .catch((err) => {
                this.showError = true;
                this.loading = false;
                console.log(err);
            })
        },
        getUsers() {
            this.$http.get('api/User/All').then((res) => {
                this.users = res.data;
            })
        },
        enableAdmin(obj, prop, check) {
            if(check) {
                this.$http.post('api/Auth/AddToRole/' + obj.id + "/Admin").then((res) => { return obj[prop] = check }).catch((err) => { return obj[prop] = false });
            } else {
                this.$http.post('api/Auth/RemoveFromRole/' + obj.id + "/Admin").then((res) => { return obj[prop] = check }).catch(() => { return obj[prop] = true });
            }
        },
        reset2FA(user) {
            this.$http.post('api/Auth/Reset2FA/' + user.id).then((res) => {
                user.twoFactorEnabled = false;
            });
        }
    },
    computed: {
    },
}
</script>

<style scoped>
</style>