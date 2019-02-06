<template>
    <div id="user">
        <h2>User: {{user.userName}}</h2>
        <div class="row">
            <div class="col-md-4 mb-3">
                <div class="card mb-3">
                    <div class="card-header">User Details</div>
                    <div class="card-body">
                        <address>
                            <strong>{{user.userName}}</strong><br />
                            <abbr title="PhoneNumber">P:</abbr> {{user.phoneNumber}}<br />
                            <abbr title="Email">E:</abbr> {{user.email}}<br />
                            <abbr title="ID">ID:</abbr> {{user.id}}
                        </address>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">My Roles</div>
                    <div class="card-body">
                        <ul>
                            <li v-for="role in roles" :key="role.id">{{role}}</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header">Change Password</div>
                    <div class="card-body">
                        <p class="red">To be implemented...</p>
                    </div>
                </div>
            </div>

            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header">Two Way Authentication</div>
                    <div class="card-body">
                        <p>For security reasons it is required to set two factor authentication first. This means you need to confirm the login with another device.</p>
                        <p>To use an authenticator app go through the following steps:</p>  
                        <ol class="list">  
                            <li>  
                                <p>  
                                    Download a two-factor authenticator app like Microsoft Authenticator for  
                                    <a href="https://go.microsoft.com/fwlink/?Linkid=825071">Windows Phone</a>,  
                                    <a href="https://go.microsoft.com/fwlink/?Linkid=825072">Android</a> and  
                                    <a href="https://go.microsoft.com/fwlink/?Linkid=825073">iOS</a> or  
                                    Google Authenticator for  
                                    <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en">Android</a> and  
                                    <a href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8">iOS</a>.  
                                </p>  
                            </li>  
                            <li>  
                                <p>Scan the QR Code or enter this key <kbd>{{secretKey}}</kbd> into your two factor authenticator app. Spaces and casing do not matter.</p>
                                <div class="text-center">  
                                    <canvas id="qrCode"></canvas> 
                                </div>
                            </li>  
                            <li>  
                                <p>  
                                    Once you have scanned the QR code or input the key above, your two factor authentication app will provide you  
                                    with a unique code. Enter the code in the confirmation box below.  
                                </p>  
                                        
                                <form @submit.prevent="verify" v-if="!success">
                                    <div class="form-group">
                                        <label class="control-label">Verification Code</label>  
                                        <input class="form-control form-control-lg" autocomplete="off" v-model="twoFactorCode" />  
                                    </div>
                                    <hr/>
                                    <button type="submit" class="btn btn-leeuwen btn-full btn-lg" :disabled="loading">
                                        <v-icon name="spinner" spin v-if="loading"></v-icon> Verify 2FA
                                    </button>
                                </form>
                                <div class="alert alert-success" role="alert"  v-if="success">
                                    <strong>Success!</strong> The 2FA code is successfully verfied.
                                </div>
                            </li>  
                        </ol>  
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</template>

<script>
import QRCode from 'qrcode';
export default {
    data() {
        return {
            loading: false,
            secretKey: null,
            twoFactorCode: null,
            success: false
        }
    },
    created() {
        this.getKey().then(() => 
        {
            this.createQrCode();
        });
    },
    methods: {
        getKey() {
            return new Promise((resolve, reject) => {
                if(!!this.user.authenticatorSecretKey || this.user.authenticatorSecretKey == null)
                {
                    return this.$http.get('api/Auth/TwoFactorCode').then((res) => {
                        this.secretKey = res.data;
                        resolve();
                    })
                } else {
                    this.secretKey = this.user.authenticatorSecretKey;
                    resolve();
                }
            })
        },
        createQrCode() {
            var canvas = document.getElementById('qrCode');
    
            const url = encodeURI('otpauth://totp/' + process.env.NODE_ENV + ':' + this.userName + '?secret=' + this.secretKey +'&issuer=PDB&digits=6');
            QRCode.toCanvas(canvas, url);

        },
        verify() {
            this.loading = true;
            this.$store.dispatch("AUTH_2FA", { UserName: this.user.userName, TwoFactorCode: this.twoFactorCode, PassWord: "empty", RememberMe: false })
            .then((res) => {
                this.success = true;
                this.loading = false;
            })
            .catch(() => {
                this.loading = false;
            })
        }
    },
    computed: {
        user() {
            return this.$store.getters.user;
        },
        roles() {
            return this.$store.getters.roles;
        }
    },
    watch: {
        secretKey() {
            this.createQrCode();
        }
    }
}
</script>

<style scoped>
</style>