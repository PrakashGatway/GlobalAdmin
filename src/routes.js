import React from 'react'


import BlogCategories from './views/websitePages/BlogsCategories'
import Blogs from './views/websitePages/Blogs'
import BlogForm from './views/websitePages/BlogForm'
import Subjects from './views/courses/Subjects'
import Testimonials from './views/websitePages/Testimonials'
import ContactManagement from './views/websitePages/Contactus'
import CourseCategories from './views/courses/CategoriesList'
import FAQ from './views/websitePages/Faq'
import Gallery from './views/websitePages/Gallery'
import Scholarships from './views/scholarship/Scholarship'
import { useAuth } from './context/AuthContext'
import AdminNotifications from './views/notify/NotificationPage'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const UserList = React.lazy(() => import('./views/user-management/UserList'))
const Universities = React.lazy(() => import('./views/universities/Universities'))
const Courses = React.lazy(() => import('./views/courses/Courses'))
const Countries = React.lazy(() => import('./views/countries/Countries'))
const Support = React.lazy(() => import('./views/support/Support'))
const ProfileSettings = React.lazy(() => import('./views/profile/ProfileSettings'))
const Coupons = React.lazy(() => import('./views/coupons/Coupons'))
const ApplicationHistory = React.lazy(() => import('./views/application-history/ApplicationHistory'))
const PageInformation = React.lazy(() => import('./views/page-information/PageInformation'))


const adminRoutes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/user-management', name: 'User Management', element: UserList },
  { path: '/universities', name: 'Universities', element: Universities },
  { path: '/courses', name: 'Courses', element: Courses },
  { path: '/courses/categories', name: 'Courses Categories', element: CourseCategories },
  { path: '/subjects', name: 'Subjects', element: Subjects },
  { path: '/countries', name: 'Countries', element: Countries },
  { path: '/support', name: 'Support', element: Support },
  { path: '/coupons', name: 'Coupons', element: Coupons },
  { path: '/application-history', name: 'Application History', element: ApplicationHistory },
  { path: '/website/pages', name: 'Pages', element: PageInformation },
  { path: '/categories', name: 'Blog Categories', element: BlogCategories },
  { path: '/blogs', name: 'Blog Categories', element: Blogs },
  { path: '/blogs/create', name: 'Blog Categories', element: BlogForm },
  { path: '/blogs/:id', name: 'Blog Categories', element: BlogForm },
  { path: '/testimonials', name: 'Testimonials', element: Testimonials },
  { path: '/contact', name: 'Testimonials', element: ContactManagement },
  { path: '/faq', name: 'Faq', element: FAQ },
  { path: '/gallery', name: 'Gallery', element: Gallery },
  { path: '/scholarship', name: 'Scholarships', element: Scholarships },
  { path: '/profile', name: 'Profile Settings', element: ProfileSettings },
  { path: '/notification', name: 'Notification', element:  AdminNotifications},

]

const managerRoutes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/website/pages', name: 'Pages', element: PageInformation },
  { path: '/categories', name: 'Blog Categories', element: BlogCategories },
  { path: '/blogs', name: 'Blog Categories', element: Blogs },
  { path: '/blogs/create', name: 'Blog Categories', element: BlogForm },
  { path: '/blogs/:id', name: 'Blog Categories', element: BlogForm },
  { path: '/testimonials', name: 'Testimonials', element: Testimonials },
  { path: '/faq', name: 'Faq', element: FAQ },
  { path: '/gallery', name: 'Gallery', element: Gallery },
  { path: '/profile', name: 'Profile Settings', element: ProfileSettings },
]

const routes = {
  admin: adminRoutes,
  manager: managerRoutes,
}

export default routes
