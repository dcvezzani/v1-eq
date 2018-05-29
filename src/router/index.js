import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import VisitAppointments from '@/components/VisitAppointments'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'VisitAppointments',
      component: VisitAppointments
    }
  ]
})
