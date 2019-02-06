import Vue from 'vue'
import router from '../router';

export default {
    state: {
        project: null,
        projectId: null,    
        deliveryConditions: []
    },
    getters: {
        project: state => state.project,
        projectId: state => state.projectId,
        deliveryConditions: state => state.deliveryConditions
    },
    actions: {
        SET_PROJECT_ID({commit, dispatch}, id) {
            commit('SET_PROJECT_ID', id);
            dispatch('GET_PROJECT', id);
        },
        SET_PROJECT({commit, dispatch}, project) {
            return Vue.http.put('api/projects/' + project.id, project).then((res) => {
                commit('SET_PROJECT', project);
            });
        },
        GET_PROJECT({commit, dispatch}, id) {
            return new Promise((resolve, reject) => {
                if(!id)
                {
                    commit('SET_PROJECT_ID', null);
                    commit('SET_PROJECT', null);
                    resolve();
                    return;
                }
    
                return Vue.http.get('api/projects/' + id).then((res) => {
                    commit('SET_PROJECT_ID', id);
                    commit('SET_PROJECT', res.data.project);
                    commit('AUTH_SUCCESS', res.data.token);
                    dispatch('SET_ROLE', res.data.roles[0]);
                    commit('SET_ROLES', res.data.roles);
                    resolve(res);
                    return;
                });
            });
        },
        GET_DELIVERY_CONDITIONS({commit, dispatch}) {
            if(this.getters.deliveryConditions.length == 0) {
                Vue.http.get('api/DeliveryConditions').then((res) => {
                    commit('SET_DELIVERY_CONDITIONS', res.data);
                });
            };
        }
    },
    mutations: {
        SET_PROJECT_ID(state, id) {
            return state.projectId = id;
        },
        SET_PROJECT(state, project) {
            return state.project = project;
        },
        SET_DELIVERY_CONDITIONS(state, conditions) {
            return state.deliveryConditions = conditions;
        }
    }
};