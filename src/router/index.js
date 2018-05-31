import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import VisitAppointments from '@/components/VisitAppointments'
import FormatVisitRequest from '@/components/FormatVisitRequest'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/VisitAppointments',
      name: 'VisitAppointments',
      component: VisitAppointments
    }, 
    {
      path: '/',
      name: 'FormatVisitRequest',
      component: FormatVisitRequest
    }, 
  ]
})
