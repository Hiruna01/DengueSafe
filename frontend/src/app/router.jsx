import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './AppLayout'
import NotFoundPage from './NotFoundPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import ItemsListPage from '../features/items/pages/ItemsListPage'
import ItemCreatePage from '../features/items/pages/ItemCreatePage'
import ItemDetailPage from '../features/items/pages/ItemDetailPage'
import ItemEditPage from '../features/items/pages/ItemEditPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'items', element: <ItemsListPage /> },
      { path: 'items/new', element: <ItemCreatePage /> },
      { path: 'items/:id', element: <ItemDetailPage /> },
      { path: 'items/:id/edit', element: <ItemEditPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default router
