import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import VisitAppointments from '@/components/VisitAppointments'
import FormatVisitRequest from '@/components/FormatVisitRequest'
import ListMembers from '@/components/ListMembers'
import ListRoles from '@/components/ListRoles'
import Members from '@/components/members/Members'
import Families from '@/components/members/Families'
import Yearbook from '@/components/members/Yearbook'
import Chairs from '@/components/members/Chairs'
import FamilyVisits from '@/components/members/FamilyVisits'
import WardMembers from '@/components/members/WardMembers'
import Districts from '@/components/members/Districts'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/Districts',
      name: 'Districts',
      component: Districts
    }, 
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
      path: '/WardMembers',
      name: 'WardMembers',
      component: WardMembers
    }, 
    {
      path: '/Families',
      name: 'Families',
      component: Families
    }, 
    {
      path: '/Yearbook',
      name: 'Yearbook',
      component: Yearbook
    }, 
    {
      path: '/Chairs',
      name: 'Chairs',
      component: Chairs
    }, 
    {
      path: '/FamilyVisits',
      name: 'FamilyVisits',
      component: FamilyVisits
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
