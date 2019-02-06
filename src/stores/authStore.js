import Vue from 'vue'

export default {
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    remember: localStorage.getItem('remember') || false,
    status: '',
    role: localStorage.getItem('role') || '',
    roles: localStorage.getItem('roles') || []
  },
  getters: {
    isAuthenticated: state => !!state.token && !!state.user,
    remember: state => state.remember,
    authStatus: state => state.status,
    user: state => state.user,
    role: state => state.role,
    roles: state => state.roles
  },
  actions: {
    AUTH_LOGIN: ({commit, dispatch}, user) => {
      return new Promise((resolve, reject) => {
        commit('AUTH_REQUEST');

        Vue.http.post('api/Auth/Login', user).then(resp => {
          if(user.RememberMe)
          {
            localStorage.setItem('remember', user.RememberMe)
          }
          
          commit('AUTH_SUCCESS', resp.data.token);

          resolve(resp);
        })
        .catch(err => {
          localStorage.clear();
          commit('AUTH_ERROR', err)
          reject(err)
        });
      })
    },
    AUTH_2FA: ({commit, dispatch}, user) => {
      return new Promise((resolve, reject) => {
        Vue.http.post('api/Auth/TwoFactorConfirmation', user)
        .then(resp => {
          if(resp.data != null && resp.data != '')
          {
            if(user.RememberMe)
            {
              localStorage.setItem('token', resp.data.token);
              localStorage.setItem('user', JSON.stringify(resp.data.user));
            }
            commit('AUTH_SUCCESS', resp.data.token);
            commit('SET_USER', resp.data.user);
            commit('SET_ROLE', resp.data.user.roles[0]);
          }
          resolve(resp)
        })
        .catch(err => {
          localStorage.clear();
          commit('AUTH_ERROR', err)
          reject(err)
        });
      })
    },
    AUTH_LOGOUT: ({commit, dispatch}) => {
      return new Promise((resolve, reject) => {
        localStorage.clear();
        commit('AUTH_LOGOUT');
        resolve();
      })
    },
    GET_USER: ({commit, dispatch}, user) => {
      return new Promise((resolve, reject) => {
        if(user != null && user != '')
        {
          commit('SET_USER', user);
          resolve(user);
          return;
        } else {
          Vue.http.get(process.env.API_HOST + '/api/User/Current').then((res) =>
          {
            commit('SET_USER', res.data);
            resolve(res.data);
            return;
          }).catch((err) =>
          {
            dispatch('AUTH_LOGOUT')
            reject();
            return;
          })
        };
      });
    },
    GET_ROLE: ({commit, dispatch}, role) => {
      return new Promise((resolve, reject) => {
        if(role != null && role != '')
        {
          commit('SET_ROLE', role);
          resolve(role);
        } else {
          Vue.http.get('api/User/Roles').then((res) =>
          {
            //commit('SET_ROLES', res.data);
            dispatch('SET_ROLE', res.data[0]);
            resolve(res.data);
          })
        };
      });
    },
    SET_ROLE: ({commit, dispatch}, role) => {
      localStorage.setItem('role', role);
      commit('SET_ROLE', role);
    }
  },
  mutations: {
    AUTH_REQUEST: (state) => {
      state.status = 'loading';
    },
    AUTH_SUCCESS: (state, token) => {
      state.status = 'success';
      state.token = token;
      localStorage.setItem('token', token);
      Vue.http.headers.common['Authorization'] = 'Bearer ' + token
    },
    AUTH_LOGOUT: (state) => {
      state.token = null;
      state.user = null;
      state.status = '';
    },
    AUTH_ERROR: (state) => {
      state.token = null;
      state.user = null;
      state.status = 'error';
    },
    SET_USER: (state, user) => {
      state.user = user;
    },
    SET_ROLE: (state, role) => {
      localStorage.setItem('role', role);
      state.role = role;
    },
    SET_ROLES(state, roles) {
      localStorage.setItem('roles', roles);
      return state.roles = roles
    }
  }
};
