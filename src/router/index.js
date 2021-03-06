import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import VisitAppointments from '@/components/VisitAppointments'
import FormatVisitRequest from '@/components/FormatVisitRequest'
import ListMembers from '@/components/ListMembers'
import ListRoles from '@/components/ListRoles'
import Members from '@/components/members/Members'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/VisitAppointments',
      name: 'VisitAppointments',
      component: VisitAppointments
    }, 
    {
      path: '/ListMembers',
      name: 'ListMembers',
      component: ListMembers
    }, 
    {
      path: '/Members',
      name: 'Members',
      component: Members
    }, 
    {
      path: '/ListRoles',
      name: 'ListRoles',
      component: ListRoles
    }, 
    {
      path: '/',
      name: 'FormatVisitRequest',
      component: FormatVisitRequest
    }, 
  ]
})
