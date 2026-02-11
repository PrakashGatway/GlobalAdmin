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

const adminRoutes = [
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
      },
      {
        component: CNavItem,
        name: 'Scholarships',
        to: '/scholarship',
      },
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
    name: 'Leads',
    to: '/contact',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
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

const managerRoutes =[
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
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
  }
]

const _nav = {
  admin: adminRoutes,
  manager: managerRoutes
}
export default _nav
