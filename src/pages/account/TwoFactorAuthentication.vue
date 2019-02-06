<template>
    <div id="confirm-card">
        <div class="container">
            <div class="card">
                <div class="card-header">Security - Two Factor Authentication</div>
                <div class="card-body">
                    <p>Hi {{userName}},</p>
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
                            <canvas id="qrCode"></canvas> 
                        </li>  
                        <li>  
                            <p>  
                                Once you have scanned the QR code or input the key above, your two factor authentication app will provide you  
                                with a unique code. Enter the code in the confirmation box below.  
                            </p>  
                            <div class="row">  
                                <div class="col-md-6">  
                                    
                                    <form @submit.prevent="verify">
                                        <div class="form-group">
                                            <label class="control-label">Verification Code</label>  
                                            <input class="form-control form-control-lg" autocomplete="off" v-model="twoFactorCode" id="twoFactorCodeInput" />  
                                        </div>
                                        
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="" name="pdbRememberBrowser" id="pdbRememberBrowser" v-model="rememberBrowser">
                                            <label class="form-check-label" for="pdbRememberBrowser">
                                            Remember Me?
                                            </label>
                                        </div>
                                        <hr/>
                                        <button type="submit" class="btn btn-leeuwen btn-full btn-lg mb-3" :disabled="loading">
                                            <v-icon name="spinner" spin v-if="loading"></v-icon> Verify 2FA
                                        </button>
                                        <div class="alert alert-danger" role="alert" v-if="showError">
                                            <strong>Failed</strong> Two Factor Authentication failed.
                                        </div>
                                    </form>
                                </div>  
                            </div>  
                        </li>  
                    </ol>  
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
            twoFactorCode: null,
            rememberBrowser: false,
            showError: false
        }
    },
    methods: {
        verify()
        {
            this.loading = true;
            this.showError = false;
            this.$store.dispatch("AUTH_2FA", { UserName: this.userName, TwoFactorCode: this.twoFactorCode, PassWord: "empty", RememberMe: this.rememberBrowser}).then((res) => {
                this.loading = false;
                this.$router.push("/");
            })
            .catch((res) => {
                this.showError = true;
                this.loading = false;
                console.log(err);
            })
            
        }
    },
    mounted() {
        var canvas = document.getElementById('qrCode');
 
        const url = encodeURI('otpauth://totp/' + process.env.NODE_ENV + ':' + this.userName + '?secret=' + this.secretKey +'&issuer=PDB&digits=6');
        QRCode.toCanvas(canvas, url);

        setTimeout(() => {
            document.getElementById("twoFactorCodeInput").focus();
        }, 1);
    },
    computed:{
        user() {
            return this.$store.getters.user;
        },
        userName() {
            return this.$route.params.userName;
        },
        secretKey() {
            return this.$route.params.secretKey;
        }
    }
}
</script>

<style scoped>
</style>