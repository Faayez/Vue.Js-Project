import Vue from 'vue'

export default {
  state: {
    customers: [],
    opcos: [],
    view: 'Customer',
  },
  getters: {
    customers: state => state.customers,
    opcos: state => state.opcos,
    view: state => state.view,
  },
  actions: {
    GET_CUSTOMERS: ({commit, dispatch}) => {
        return Vue.http.get('api/customers').then((res) => {
            res.data.data.forEach((c) => { return c.filter = '', c.isDirty = false });
            commit('SET_CUSTOMERS', res.data.data);
        });
    },
    GET_OPCOS: ({commit, dispatch}) => {
        return Vue.http.get('api/opcos').then((res) => {
            res.data.data.forEach((c) => { return c.filter = '', c.isDirty = false });
            commit('SET_OPCOS', res.data.data);
        });
    },
    SET_VIEW: ({commit, dispatch}, view) => {
      commit('CURRENT_VIEW', view);
    },
  },
  mutations: {
    CURRENT_VIEW: (state, view) => {
        state.view = view
    },
    ADD_CUSTOMER: (state, customer) => {
        state.customers.push(customer)
    },
    REMOVE_CUSTOMER: (state, customer) => {
        state.customers.splice(state.customers.indexOf(customer), 1);
    },
    ADD_OPCO: (state, opco) => {
        state.opcos.push(opco);
    },
    REMOVE_OPCO: (state, opco) => {
        state.opcos.splice(state.opcos.indexOf(state), 1);
    },
    SET_CUSTOMERS: (state, customers) => {
        state.customers = customers
    },
    SET_OPCOS: (state, opcos) => {
        state.opcos = opcos
    }
  }
};
