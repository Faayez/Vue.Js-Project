import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/pages/home/Index'
import Dashboard from '@/pages/project/Dashboard'
import ProjectOrders from '@/pages/project/ProjectOrders'
import Expediting from '@/pages/project/Expediting'
import Shipping from '@/pages/project/Shipping'
import Inspection from '@/pages/project/Inspection'
import Warehouse from '@/pages/project/Warehouse/Index'
import GoodsReceipt from '@/pages/project/Warehouse/GoodsReceipt'
import Stock from '@/pages/project/Warehouse/Stock'
import CallOffOrder from '@/pages/project/Warehouse/CallOffOrder'
import PickingLists from '@/pages/project/Warehouse/PickingLists'
import PickingList from '@/pages/project/Warehouse/PickingList'
import WarehouseLocations from '@/pages/project/Warehouse/Locations'
import WarehouseShipping from '@/pages/project/Warehouse/Shipping'
import DUF from '@/pages/project/DUF'
import ProjectConfiguration from '@/pages/project/Configuration'
import Configuration from '@/pages/configuration/Index'
import Customer from '@/pages/home/Customer'
import Opco from '@/pages/home/Opco'
import Project from '@/pages/home/Project'
import Login from '@/pages/account/Login'
import TwoFactorAuthentication from '@/pages/account/TwoFactorAuthentication'
import User from '@/pages/account/User'
import Settings from '@/pages/account/Settings'
import UnAuthorized from '@/pages/account/UnAuthorized'
import NotFound from '@/pages/account/NotFound'
import Manage from '@/pages/manage/Index'
import Articles from '@/pages/manage/Articles'
import store from '@/stores/store.js';

Vue.use(Router)

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next()
    return
  }
  next('/')
}

const ifAuthenticated = (to, from, next) => {
  store.dispatch('GET_USER', store.getters.user).then((user) =>
  {
    if(user == null || user == '')
    {
      next('/account/login');
      return;
    }

    if((!!to.params.projectId && !store.getters.project) || to.params.projectId != store.getters.projectId) 
    {
      store.dispatch("GET_PROJECT", to.params.projectId)
    }
    
    if(to.meta.roles != null) 
    {
      if(!to.meta.roles.some((r) => { return store.getters.roles.indexOf(r) >= 0}))
      {
        next('/unauthorized');
        return
      }
    }

    if (store.getters.isAuthenticated) {
      next()
      return
    }
    next('/account/login')
  }).catch((err) =>
  {
    next('/account/login');
  })
}

export default new Router({
  routes: [
    { 
      path: "*", 
      name: 'NotFound',
      component: NotFound, 
      meta: {
        title: 'NotFound',
      }
    },
    {
      path: '/',
      name: 'Index',
      component: Index,
      meta: {
        title: 'Home',
        //roles: ['Admin', 'User', 'SuperUser', 'Expediter', 'Inspector', 'Shipper']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/account/login',
      name: 'Login',
      component: Login,
      meta: {
        title: 'Login'
      },
      beforeEnter: ifNotAuthenticated
    },
    {
      path: '/account/twofactorauthentication/:userName/:secretKey',
      name: 'Two Factor Authentication',
      component: TwoFactorAuthentication,
      meta: {
        title: 'Security | Two Factor Authentication'
      },
      beforeEnter: ifNotAuthenticated
    },
    {
      path: '/account/user',
      name: 'User',
      component: User,
      meta: {
        title: 'User'
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/account/settings',
      name: 'Settings',
      component: Settings,
      meta: {
        title: 'Settings'
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/home/customer/:id?',
      name: 'Customer',
      component: Customer,
      meta: {
        title: 'Customer',
        roles: ['Admin', 'ProjectAdmin' ]
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/home/opco/:id?',
      name: 'Opco',
      component: Opco,
      meta: {
        title: 'OPCO',
        roles: ['Admin', 'ProjectAdmin']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/home/project/:projectId?',
      name: 'NewProject',
      component: Project,
      meta: {
        title: 'Project',
        roles: ['Admin', 'ProjectAdmin']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/project/:projectId/dashboard/',
      name: 'Project',
      component: Dashboard,
      meta: {
        title: 'Project Dashboard'
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/project/:projectId/projectorders/',
      name: 'ProjectOrders',
      component: ProjectOrders,
      meta: {
        title: 'Project Orders',
        roles: ['Admin', 'SuperUser']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/project/:projectId/expediting/',
      name: 'Expediting',
      component: Expediting,
      meta: {
        title: 'Expediting',
        roles: ['Admin', 'SuperUser', 'Expediter']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/project/:projectId/duf/',
      name: 'DUF',
      component: DUF,
      meta: {
        title: 'DUF',
        roles: ['Admin', 'SuperUser']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/project/:projectId/shipping/:type',
      name: 'Shipping',
      component: Shipping,
      meta: {
        title: 'Shipping',
        roles: ['Admin', 'SuperUser', 'Shipper']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/project/:projectId/inspection/',
      name: 'Inspection',
      component: Inspection,
      meta: {
        title: 'Inspection',
        roles: ['Admin', 'SuperUser', 'Inspector']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/project/:projectId/warehouse/',
      name: 'Warehouse',
      component: Warehouse,
      meta: {
        title: 'Warehouse',
        roles: ['Admin', 'SuperUser', 'Warehouse']
      },
      beforeEnter: ifAuthenticated,
      children: [
        {
          path: 'goodsreceipt',
          name: 'GoodsReceipt',
          component: GoodsReceipt,
          meta: {
            title: 'Goods Receipt',
            roles: ['Admin', 'SuperUser', 'Warehouse']
          },
          beforeEnter: ifAuthenticated,
        },
        {
          path: 'stock',
          name: 'Stock',
          component: Stock,
          meta: {
            title: 'Stock Management',
            roles: ['Admin', 'SuperUser', 'Warehouse']
          },
          beforeEnter: ifAuthenticated,
        },
        {
          path: 'callofforder',
          name: 'CallOffOrder',
          component: CallOffOrder,
          meta: {
            title: 'Call-Off Order',
            roles: ['Admin', 'SuperUser', 'Warehouse']
          },
          beforeEnter: ifAuthenticated,
        },
        {
          path: 'pickinglists',
          name: 'PickingLists',
          component: PickingLists,
          meta: {
            title: 'Picking Lists',
            roles: ['Admin', 'SuperUser', 'Warehouse']
          },
          beforeEnter: ifAuthenticated,
          children: [
            {
              path: ':pickingListId',
              name: 'PickingList',
              component: PickingList,
              meta: {
                title: 'Picking List',
                roles: ['Admin', 'SuperUser', 'Warehouse']
              },
              beforeEnter: ifAuthenticated,
            }
          ]
        },
        {
          path: 'shipping/:type',
          name: 'WarehouseShipping',
          component: Shipping,
          meta: {
            title: 'Outgoing Shipments',
            roles: ['Admin', 'Warehouse']
          },
          beforeEnter: ifAuthenticated,
        },
        {
          path: 'locations',
          name: 'WarehouseLocations',
          component: WarehouseLocations,
          meta: {
            title: 'Warehouse Locations',
            roles: ['Admin', 'SuperUser']
          },
          beforeEnter: ifAuthenticated,
        }
      ]
    },
    {
      path: '/project/:projectId/configuration/',
      name: 'ProjectConfiguration',
      component: ProjectConfiguration,
      meta: {
        title: 'Project Configuration',
        roles: ['Admin', 'ProjectAdmin', 'SuperUser']
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/manage/index',
      name: 'Manage',
      component: Manage,
      meta: {
        title: 'Manage'
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/manage/articles',
      name: 'Articles',
      component: Articles,
      meta: {
        title: 'Articles'
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/configuration',
      name: 'Configuration',
      component: Configuration,
      meta: {
        title: 'Configuration'
      },
      beforeEnter: ifAuthenticated
    },
    {
      path: '/unauthorized',
      name: 'UnAuthorized',
      component: UnAuthorized,
      meta: {
        title: 'UnAuthorized'
      }
    }
  ]
})
