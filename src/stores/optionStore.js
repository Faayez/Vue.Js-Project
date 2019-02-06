import Vue from 'vue'

export default {
    state: {
        Customers: [],
        Opcos: [],
        ShippingPackage_ShippingPackageTypeId: [],
        ProjectOrderLine_Type: [{ id: 'PIPE', text: 'PIPE'}, { id: 'COMPONENT', text: 'COMPONENT'}],
        ProjectOrderLine_QuantityUnit: [{ id: 'PCS', text: 'PCS'}, { id: 'MTRS', text: 'MTRS'}, { id: 'FT', text: 'FT'}, { id: 'SET', text: 'SET'}]
    },
    getters: {
        Customers: state => state.Customers,
        Opcos: state => state.Opcos,
        ShippingPackage_ShippingPackageTypeId: state => state.ShippingPackage_ShippingPackageTypeId,
        ProjectOrderLine_Type: state => state.ProjectOrderLine_Type,
        ProjectOrderLine_QuantityUnit: state => state.ProjectOrderLine_QuantityUnit
    },
    actions: {
        GET_OPTIONS({commit, state}, id) {
            return new Promise((resolve, reject) => {
                if(state[id].length == 0)
                {
                    Vue.http.get('api/options/' + id).then((res) => {
                        commit('SET_OPTIONS', { id: id, values: res.data });
                        resolve(res.data);
                    });
                } else {
                    resolve(state[id]);
                }
            })
        },
    },
    mutations: {
        SET_OPTIONS(state, data) {
            return state[data.id] = data.values;
        }
    }
};