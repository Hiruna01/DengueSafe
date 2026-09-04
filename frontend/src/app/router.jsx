import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './AppLayout'
import NotFoundPage from './NotFoundPage'
import ProtectedRoute from './ProtectedRoute'
import AboutPage from '../features/about/pages/AboutPage'
import LoginPage from '../features/auth/pages/LoginPage'
import RecordCasePage from '../features/cases/pages/RecordCasePage'
import DashboardPage from '../features/divisions/pages/DashboardPage'
import RiskBoardPage from '../features/divisions/pages/RiskBoardPage'
import LandingPage from '../features/landing/pages/LandingPage'
import OfficerManagementPage from '../features/officers/pages/OfficerManagementPage'
import MyReportsPage from '../features/reports/pages/MyReportsPage'
import NewReportPage from '../features/reports/pages/NewReportPage'
import InspectionQueuePage from '../features/reports/pages/InspectionQueuePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'risk-board', element: <RiskBoardPage /> },
      { path: 'report', element: <NewReportPage /> },
      { path: 'my-reports', element: <MyReportsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'login', element: <LoginPage /> },

      // Signed-in officers only. The API enforces the same rule; these routes
      // just avoid rendering a page that could only fill itself with 401s.
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'queue', element: <InspectionQueuePage /> },
          { path: 'cases', element: <RecordCasePage /> },
          { path: 'dashboard', element: <DashboardPage /> },
        ],
      },

      // Admins only.
      {
        element: <ProtectedRoute adminOnly />,
        children: [{ path: 'officers', element: <OfficerManagementPage /> }],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default router
