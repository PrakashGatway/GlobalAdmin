import React from 'react'


import BlogCategories from './views/websitePages/BlogsCategories'
import Blogs from './views/websitePages/Blogs'
import BlogForm from './views/websitePages/BlogForm'
import Subjects from './views/courses/Subjects'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const UserList = React.lazy(() => import('./views/user-management/UserList'))
const UserWallets = React.lazy(() => import('./views/user-management/UserWallets'))
const Universities = React.lazy(() => import('./views/universities/Universities'))
const Courses = React.lazy(() => import('./views/courses/Courses'))
const Countries = React.lazy(() => import('./views/countries/Countries'))
const Support = React.lazy(() => import('./views/support/Support'))
const ProfileSettings = React.lazy(() => import('./views/profile/ProfileSettings'))
const Coupons = React.lazy(() => import('./views/coupons/Coupons'))
const ApplicationHistory = React.lazy(() => import('./views/application-history/ApplicationHistory'))
const PageInformation = React.lazy(() => import('./views/page-information/PageInformation'))

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/user-management/user-list', name: 'User List', element: UserList },
  { path: '/user-management/user-wallets', name: 'User Wallets', element: UserWallets },
  { path: '/user-management', name: 'User Management', element: UserList },
  { path: '/universities', name: 'Universities', element: Universities },
  { path: '/courses', name: 'Courses', element: Courses },
  { path: '/subjects', name: 'Subjects', element: Subjects },
  { path: '/countries', name: 'Countries', element: Countries },
  { path: '/support', name: 'Support', element: Support },
  { path: '/coupons', name: 'Coupons', element: Coupons },
  { path: '/application-history', name: 'Application History', element: ApplicationHistory },
  { path: '/website/pages', name: 'Pages', element: PageInformation },
  { path: '/website/pages/add', name: 'Add Page', element: PageInformation },
  { path: '/categories', name: 'Blog Categories', element: BlogCategories },
  { path: '/blogs', name: 'Blog Categories', element: Blogs },
  { path: '/blogs/create', name: 'Blog Categories', element: BlogForm },
  { path: '/blogs/:id', name: 'Blog Categories', element: BlogForm },
  { path: '/profile', name: 'Profile Settings', element: ProfileSettings },
]

export default routes
