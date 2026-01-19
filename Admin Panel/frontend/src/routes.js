import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const UserList = React.lazy(() => import('./views/user-management/UserList'))
const UserWallets = React.lazy(() => import('./views/user-management/UserWallets'))
const Universities = React.lazy(() => import('./views/universities/Universities'))
const Courses = React.lazy(() => import('./views/courses/Courses'))
const Programs = React.lazy(() => import('./views/programs/Programs'))
const Countries = React.lazy(() => import('./views/countries/Countries'))
const Support = React.lazy(() => import('./views/support/Support'))
const ProfileSettings = React.lazy(() => import('./views/profile/ProfileSettings'))
const Coupons = React.lazy(() => import('./views/coupons/Coupons'))
const ApplicationHistory = React.lazy(() => import('./views/application-history/ApplicationHistory'))
const PageInformation = React.lazy(() => import('./views/page-information/PageInformation'))
const PagesList = React.lazy(() => import('./views/pages/PagesList'))

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/user-management/user-list', name: 'User List', element: UserList },
  { path: '/user-management/user-wallets', name: 'User Wallets', element: UserWallets },
  { path: '/user-management', name: 'User Management', element: UserList },
  { path: '/universities', name: 'Universities', element: Universities },
  { path: '/courses', name: 'Courses', element: Courses },
  { path: '/programs', name: 'Programs', element: Programs },
  { path: '/countries', name: 'Countries', element: Countries },
  { path: '/support', name: 'Support', element: Support },
  { path: '/coupons', name: 'Coupons', element: Coupons },
  { path: '/application-history', name: 'Application History', element: ApplicationHistory },
  { path: '/website/pages', name: 'Pages', element: PagesList },
  { path: '/website/pages/add', name: 'Add Page', element: PageInformation },
  { path: '/website/pages/edit', name: 'Edit Page', element: PageInformation },
  { path: '/page-information', name: 'Page Information', element: PageInformation }, // Keep for backward compatibility
  { path: '/profile', name: 'Profile Settings', element: ProfileSettings },
]

export default routes
