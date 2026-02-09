import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilWallet,
  cilEducation,
  cilBook,
  cilList,
  cilFlagAlt,
  cilInfo,
  cilTag,
  cilDescription,
  cilFile,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'User Management',
    to: '/user-management',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User List',
        to: '/user-management',
      }
    ],
  },
  {
    component: CNavItem,
    name: 'Leads Management',
    to: '/contact',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Scholarship Management',
    to: '/scholarship',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Course Management',
    to: '/',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Categories',
        to: '/courses/categories',
      },
      {
        component: CNavItem,
        name: 'Subjects',
        to: '/subjects',
      },
      {
        component: CNavItem,
        name: 'Programs',
        to: '/courses',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Blogs Management',
    to: '/blog',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'New Blog',
        to: '/blogs/create',
      },
      {
        component: CNavItem,
        name: 'Blogs',
        to: '/blogs',
      },
      {
        component: CNavItem,
        name: 'Categories',
        to: '/categories',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Website Management',
    to: '/website',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Pages',
        to: '/website/pages',
      },
      {
        component: CNavItem,
        name: 'Testimonials',
        to: '/testimonials',
      },
      {
        component: CNavItem,
        name: 'Gallery',
        to: '/gallery',
      },
      {
        component: CNavItem,
        name: 'Faq',
        to: '/faq',
      }
    ],
  },
  {
    component: CNavItem,
    name: 'Universities',
    to: '/universities',
    icon: <CIcon icon={cilEducation} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Application',
    to: '/application-history',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Countries',
    to: '/countries',
    icon: <CIcon icon={cilFlagAlt} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Coupons',
    to: '/coupons',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Support',
    to: '/support',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  }
]

export default _nav
