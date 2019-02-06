<template>
  <div id="login-card">
    <div class="alert alert-success" role="alert" v-if="isSuccess">
      <strong>Login Success!</strong>
    </div>
    <div class="alert alert-danger" role="alert"  v-if="hasErrors">
      <strong>Login Failed!</strong> {{error}}
    </div>

    <div class="card">
      <div class="card-body">
        <img src="static/IT_IF_Medical.png" />
        <br>
        <img src="static/pdb.jpg" />
        <hr>
        <form class="login" @submit.prevent="login" v-if="!show2FA">
          <div class="form-group">
            <div class="input-group input-group-lg">
              <div class="input-group-prepend">
                <span class="input-group-text">
                  <v-icon name="user"></v-icon>
                </span>
              </div>
              <input required v-model="username" type="text" placeholder="UserName" class="form-control" name="pdbUsername" id="pdbUsername"/>
            </div>
          </div>
          <div class="form-group">
            <div class="input-group input-group-lg">
              <div class="input-group-prepend">
                <span class="input-group-text">
                  <v-icon name="lock" ></v-icon>
                </span>
              </div>
              <input required v-model="password" type="password" placeholder="Password"  class="form-control" name="pdbPassword" id="pdbPassword"/>
            </div>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" name="pdbRememberMe" id="pdbRememberMe" v-model="rememberMe">
            <label class="form-check-label" for="pdbRememberMe">
              Remember Me?
            </label>
          </div>
          <hr/>
          <button type="submit" class="btn btn-leeuwen btn-full btn-lg" :disabled="loading">
              <v-icon name="spinner" spin v-if="loading"></v-icon> Login
          </button>
        </form>
        <form v-else @submit.prevent="verifyTwoFactorAuthentication">
          <div class="form-group">
            <input required v-model="twoFactorCode" type="text" placeholder="Two Factor Authentication Code" class="form-control  form-control-lg" id="twoFactorCodeInput" />
          </div>
          <hr/>
          <button type="submit" class="btn btn-leeuwen btn-full btn-lg" :disabled="loading">
              <v-icon name="spinner" spin v-if="loading"></v-icon> Verify 2FA
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Index',
  components: {
  },
  data () {
    return {
      username: '',
      password: '',
      rememberMe: false,
      rememberBrowser: false,
      twoFactorCode: null,
      error: 'Login Failed.',
      hasErrors: false,
      isSuccess: false,
      show2FA: false,
      loading: false
    }
  },
  mounted() {
    localStorage.clear();
    this.$store.dispatch("AUTH_LOGOUT");
    
    setTimeout(() => {
      document.getElementById("pdbUsername").focus();
    }, 1);
  },
  methods: {
    login() {
      this.isSuccess = false;
      this.hasErrors = false;
      this.loading = true;
      const { username, password } = this;
      this.$store.dispatch('AUTH_LOGIN', { UserName: this.username, PassWord: this.password, RememberMe: this.rememberMe }).then((resp) => {
        this.isSuccess = true;
        this.loading = false;
        if(resp.data.twoFactorEnabled)
        {
          this.show2FA = true;
          setTimeout(() => {
            document.getElementById("twoFactorCodeInput").focus();
          }, 1);
        } 
        else 
        {
          this.$router.push('/account/twofactorauthentication/' + this.username + '/' + resp.data.authenticatorSecretKey);
        }
      }).catch((err) => {
        this.error = err.data;
        this.hasErrors = true;
        this.loading = false;
      })
    },
    verifyTwoFactorAuthentication() {
      this.loading = true;
      this.$store.dispatch('AUTH_2FA', { UserName: this.username, PassWord: 'empty', RememberMe: this.rememberMe, TwoFactorCode: this.twoFactorCode }).then((resp) => {
        this.$router.push("/");
      }).catch((err) => {
        this.error = err.data;
        this.hasErrors = true;
        this.loading = false;
      });
    },
    logout() {
      this.$store.dispatch('AUTH_LOGOUT')
      .then(() => {
        this.$router.push('/login')
      })
    }
  }
}
</script>

<style scoped>
.card {
  position:absolute;
  top:0;
  bottom:0;
  margin:auto;
  left: 0;
  right: 0;
  width: 500px;
  height: 400px;
  max-width: 100%;
  padding: 15px;
}

</style>
