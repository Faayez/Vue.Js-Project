<template>
    <div class="tab-pane fade show" :id="this.tab.id" role="tabpanel">
        <div class="row">
            <div class="col-md-10 table-responsive mb-3">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>UserName</th>
                            <th v-for="role in roles" :key="role.id">{{role.name}}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr :key="u.id" v-for="u in projectUsers">
                            <td>{{u.userName}}</td>
                            <td v-for="role in roles" :key="role.id">
                                <checkbox v-on:toggle="toggleRole" :property="role.id" :object="u" :check="isChecked(u, role.id)" size="2"></checkbox>
                            </td>
                            <td class="text-right">
                                <button class="btn btn-sm btn-leeuwen" @click="removeFromProject(u)">
                                    <v-icon name="trash-alt"></v-icon>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-md-2 mb-3">
                <h3>All Users</h3>
                <div class="list-group">
                    <button type="button" class="list-group-item list-group-item-action" :key="user.id" v-for="user in users" @click="addToProject(user)">{{user.userName}}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CheckBox from '@/components/CheckBox'
    export default {
        name: '',
        props: ['tab'],
        components: {
            'checkbox': CheckBox
        },
        data() {
            return {
                users: [],
                projectUsers: [],
                roles: []
            }
        },
        created() {
            this.getRoles();
            this.getUsers();
            this.getProjectUsers();
        },
        methods: {
            isChecked(user, role)
            {
                if(user.projectUserRoles == null)
                    return false;

                if(user.projectUserRoles.some((c) => { return c.roleId == role}))
                    return true;
                return false;
            },
            getUsers() {
                return this.$http.get('api/User/All').then((res) => {
                    this.users = res.data.map((u) => { return u; });
                })
            },
            getRoles() {
                return this.$http.get('api/User/Roles').then((res) => {
                    this.roles = res.data.map((u) => { return u; }).filter((c) => { return c.name.toLowerCase().indexOf('admin') < 0 });
                });
            },
            getProjectUsers() {
                return this.$http.get('api/ProjectUsers/' + this.$route.params.projectId).then((res) => {
                    this.projectUsers = res.data.map((u) => { return u });
                });
            },
            addToProject(user) {
                if(!this.projectUsers.some((u) => { return u.userName == user.userName }))
                {
                    var projectUser = {
                        projectId: this.$route.params.projectId,
                        userName: user.userName,
                        projectUserRoles: []
                    };
                    return this.$http.post('api/ProjectUsers', projectUser).then((res) => {
                        projectUser.id = res.data;
                        this.projectUsers.push(projectUser);
                    });
                }
            },
            removeFromProject(user) {
                return this.$http.delete('api/ProjectUsers/' + user.id).then((res) => {
                    this.projectUsers.splice(this.projectUsers.indexOf(user), 1);
                });
            },
            toggleRole(user, role)
            {
                if(user.projectUserRoles.some((r) => { return r.roleId == role }))
                {
                    return this.removeFromRole(user.id, role);
                }
                
                let r = this.roles.find((c) => { return c.id == role});
                if(r.name.toLowerCase() == "superuser")
                {
                    r = this.roles.filter((c) => { 
                        return c.name.toLowerCase() == 'expediter' 
                        || c.name.toLowerCase() == 'shipper' 
                        || c.name.toLowerCase() == 'warehouse' 
                        || c.name.toLowerCase() == 'inspector' });

                    r.forEach((c) => {
                        this.addToRole(user.id, c.id);
                    });
                }
                return this.addToRole(user.id, role);
            },
            addToRole(userId, role) {
                return this.$http.put('api/ProjectUsers/AddRole/' + userId + '/' + role).then((res) => {
                    const user = this.projectUsers.find((u) => { return u.id == userId});
                    user.projectUserRoles.push(res.data);
                })
            },
            removeFromRole(userId, role) {
                return this.$http.delete('api/ProjectUsers/RemoveRole/' + userId + '/' + role).then((res) => {
                    const user = this.projectUsers.find((u) => { return u.id == userId});
                    user.projectUserRoles.splice(user.projectUserRoles.findIndex((r) => { return r.roleId == role}), 1);
                })
            }
        }
    }
</script>

<style scoped>
</style>